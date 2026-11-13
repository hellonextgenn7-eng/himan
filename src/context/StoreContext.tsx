import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Product,
  CartItem,
  Order,
  StoreSettings,
  OrderStatus,
  CustomerDetails,
  CustomerAccount,
  CustomerFeedback,
  FeedbackCategory,
  ExchangeTradeIn
} from '../types';
import { INITIAL_PRODUCTS } from '../data/products';
import { toProductSlug, findProductBySlugOrId } from '../utils/slug';
import { enrichProductSpecs } from '../utils/specEnricher';
import {
  auth,
  db,
  googleAuthProvider,
  handleFirestoreError,
  OperationType,
  testFirebaseConnection
} from '../services/firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

export type AccountModalTab =
  | 'overview'
  | 'orders'
  | 'wishlist'
  | 'addresses'
  | 'feedback'
  | 'profile';

export interface AddToCartOptions {
  selectedRam?: string;
  selectedStorage?: string;
  selectedColor?: string;
  selectedVariantId?: string;
  variantSellingPrice?: number;
  variantOriginalPrice?: number;
}

interface StoreContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviewCount'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetProductsToDefault: () => void;

  cart: CartItem[];
  addToCart: (
    product: Product,
    quantity?: number,
    selectedStorage?: string,
    selectedColor?: string,
    options?: AddToCartOptions
  ) => void;
  removeFromCart: (productId: string, selectedStorage: string, selectedColor: string, selectedRam?: string) => void;
  updateCartQuantity: (
    productId: string,
    selectedStorage: string,
    selectedColor: string,
    newQty: number,
    selectedRam?: string
  ) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartOriginalTotal: number;
  cartCount: number;

  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Smartphone Comparison (up to 3 devices)
  compareList: Product[];
  toggleCompare: (product: Product) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (open: boolean) => void;

  // Exchange Trade-In
  activeExchange: ExchangeTradeIn | null;
  setActiveExchange: (exchange: ExchangeTradeIn | null) => void;
  isExchangeModalOpen: boolean;
  setIsExchangeModalOpen: (open: boolean) => void;

  orders: Order[];
  createOrder: (orderInput: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingId?: string, courierPartner?: string) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  requestOrderReturn: (orderId: string, reason?: string) => void;
  getOrderById: (orderId: string) => Order | undefined;

  // Customer Feedback & Support Hub
  feedbacks: CustomerFeedback[];
  submitFeedback: (input: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    category: FeedbackCategory;
    orderId?: string;
    productName?: string;
    rating?: number;
    subject: string;
    message: string;
  }) => Promise<CustomerFeedback>;
  updateFeedbackStatus: (
    feedbackId: string,
    status: 'Submitted' | 'In Review' | 'Resolved',
    adminReply?: string
  ) => Promise<void>;

  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;

  // Admin Access
  isAdminLoggedIn: boolean;
  adminUser: FirebaseUser | null;
  loginAdminWithPin: (pin: string) => boolean;
  loginAdminWithGoogle: () => Promise<boolean>;
  logoutAdmin: () => Promise<void>;

  // Customer Account System
  customer: { fullName: string; email: string; phone: string } | null;
  customerAccount: CustomerAccount | null;
  loginCustomer: (fullName: string, email: string, phone: string) => void;
  registerCustomer: (fullName: string, email: string, phone: string, password: string) => boolean;
  loginCustomerWithCredentials: (emailOrPhone: string, password: string) => boolean;
  loginCustomerWithGoogle: () => Promise<boolean>;
  resetCustomerPassword: (email: string, newPassword: string) => boolean;
  updateCustomerProfile: (updates: { fullName: string; email: string; phone: string }) => void;
  saveCustomerAddress: (address: CustomerDetails) => void;
  deleteCustomerAddress: (index: number) => void;
  logoutCustomer: () => void;
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;
  accountModalTab: AccountModalTab;
  setAccountModalTab: (tab: AccountModalTab) => void;
  openAccountModal: (tab?: AccountModalTab) => void;

  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  openProductPage: (product: Product) => void;
  closeProductPage: () => void;

  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isOrderTrackingOpen: boolean;
  setIsOrderTrackingOpen: (open: boolean) => void;
  isAdminViewOpen: boolean;
  setIsAdminViewOpen: (open: boolean) => void;
  activePolicy: string | null;
  setActivePolicy: (policy: string | null) => void;

  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const DEFAULT_SETTINGS: StoreSettings = {
  brandName: 'Phone Bazar',
  tagline: 'Your Dream Smartphone. At A Smarter Price.',
  officialEmail: 'officialnamoindia7@gmail.com',
  contactNumber: '',
  whatsappNumber: '',
  heroHeading: 'Your Dream Smartphone. At A Smarter Price.',
  heroSubtitle: 'Explore premium pre-owned smartphones at unbeatable prices.',
  codEnabled: false,
  freeShippingAbove: 5000,
  defaultDeliveryCharge: 0,
  razorpayKeyId: 'rzp_test_phonebajar_demo',
  razorpayMode: 'sandbox',
  cashifyGatewayEnabled: true,
  cashifyKeyId: 'csh_partner_phonebajar',
  cashifyMode: 'sandbox',
  managerPin: '8521553950',
  announcementText:
    '⚡ Verified Pre-Owned Flagship Sale Live: 32-Point Certified Smartphones | 7-Day Replacement Guarantee | Free Express Delivery Across India!',
  announcementActive: true,
  storeAddress: 'Phone Bazar Verification & Fulfillment Hub, Sector 18, Commercial Plaza, New Delhi - 110001'
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CURRENT_CATALOG_VERSION = 'v3_672_enriched_variants';

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Products state backed by Cloud Firestore + localStorage cache
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('phonebajar_products');
      const catalogVersion = localStorage.getItem('phonebajar_catalog_version');
      if (saved && catalogVersion === CURRENT_CATALOG_VERSION) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_PRODUCTS.length) {
          return parsed.map((p: Product) => enrichProductSpecs(p));
        }
      }
      const enrichedInitial = INITIAL_PRODUCTS.map((p) => enrichProductSpecs(p));
      localStorage.setItem('phonebajar_catalog_version', CURRENT_CATALOG_VERSION);
      localStorage.setItem('phonebajar_products', JSON.stringify(enrichedInitial));
      return enrichedInitial;
    } catch {
      return INITIAL_PRODUCTS.map((p) => enrichProductSpecs(p));
    }
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('phonebajar_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('phonebajar_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Compare list state (up to 3 phones)
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Active Exchange Trade-In
  const [activeExchange, setActiveExchange] = useState<ExchangeTradeIn | null>(() => {
    try {
      const saved = localStorage.getItem('phonebajar_exchange');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('phonebajar_orders');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'PB-729401',
        customer: {
          fullName: 'Siddharth Rao',
          phone: '+91 98765 43210',
          email: 'siddharth.rao@example.com',
          address: 'Flat 402, Green Meadows, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038'
        },
        items: [
          {
            product: INITIAL_PRODUCTS[3] || INITIAL_PRODUCTS[0],
            quantity: 1,
            selectedRam: (INITIAL_PRODUCTS[3] || INITIAL_PRODUCTS[0]).ram,
            selectedStorage: (INITIAL_PRODUCTS[3] || INITIAL_PRODUCTS[0]).storage,
            selectedColor: (INITIAL_PRODUCTS[3] || INITIAL_PRODUCTS[0]).color,
            variantSellingPrice: (INITIAL_PRODUCTS[3] || INITIAL_PRODUCTS[0]).sellingPrice,
            variantOriginalPrice: (INITIAL_PRODUCTS[3] || INITIAL_PRODUCTS[0]).originalPrice
          }
        ],
        subtotal: 29999,
        deliveryCharge: 0,
        discountAmount: 0,
        totalAmount: 29999,
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        orderStatus: 'Dispatched',
        paymentTransactionId: 'pay_pb_verified_821739',
        trackingId: 'BD-847291039IN',
        courierPartner: 'BlueDart Express',
        createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        estimatedDeliveryDate: 'Delivering Tomorrow by 7 PM'
      }
    ];
  });

  // Customer Feedbacks state
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>(() => {
    try {
      const saved = localStorage.getItem('phonebajar_feedbacks');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'FB-104920',
        customerName: 'Ananya Verma',
        customerEmail: 'ananya.verma@example.com',
        customerPhone: '+91 98112 34567',
        category: 'Submit Feedback',
        orderId: 'PB-729401',
        productName: 'Apple iPhone 14 Pro',
        rating: 5,
        subject: 'Superb condition & battery health as promised',
        message:
          'Received my iPhone 14 Pro within 48 hours in Delhi NCR. Battery health was 92% and the screen had zero scratches. Highly satisfied with Phone Bazar!',
        status: 'Resolved',
        adminReply: 'Thank you for shopping with Phone Bazar, Ananya! Enjoy your certified iPhone 14 Pro.',
        createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString()
      }
    ];
  });

  // Store Settings (Ensure owner's personal phone number is never exposed)
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('phonebajar_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.managerPin === '6200') {
          parsed.managerPin = '8521553950';
        }
        // Strip personal number if cached from earlier versions
        if (parsed.contactNumber && parsed.contactNumber.includes('62001')) {
          parsed.contactNumber = '';
        }
        if (parsed.whatsappNumber && parsed.whatsappNumber.includes('62001')) {
          parsed.whatsappNumber = '';
        }
        parsed.officialEmail = 'officialnamoindia7@gmail.com';
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Admin Auth State (PIN verified or Firebase Auth)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('phonebajar_admin_auth') === 'true';
  });
  const [adminUser, setAdminUser] = useState<FirebaseUser | null>(null);

  // Registered Customer Accounts directory in localStorage
  const [registeredAccounts, setRegisteredAccounts] = useState<CustomerAccount[]>(() => {
    try {
      const saved = localStorage.getItem('phonebajar_accounts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Customer Account
  const [customerAccount, setCustomerAccount] = useState<CustomerAccount | null>(() => {
    try {
      const savedAccount = localStorage.getItem('phonebajar_active_account');
      if (savedAccount) return JSON.parse(savedAccount);
      const legacyCustomer = localStorage.getItem('phonebajar_customer');
      if (legacyCustomer) {
        const parsed = JSON.parse(legacyCustomer);
        return {
          id: `cust_${Date.now()}`,
          fullName: parsed.fullName || 'Customer',
          email: parsed.email || '',
          phone: parsed.phone || '',
          savedAddresses: [],
          createdAt: new Date().toISOString()
        };
      }
      return null;
    } catch {
      return null;
    }
  });

  const customer = customerAccount
    ? {
        fullName: customerAccount.fullName,
        email: customerAccount.email,
        phone: customerAccount.phone
      }
    : null;

  // Customer Account Modal State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState<AccountModalTab>('overview');

  const openAccountModal = (tab: AccountModalTab = 'overview') => {
    setAccountModalTab(tab);
    setIsAccountModalOpen(true);
  };

  // UI Modals & Views
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    if (typeof window !== 'undefined') {
      const cleanPath = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      const hash = window.location.hash.toLowerCase();
      if (cleanPath.startsWith('/product/')) {
        const slugOrId = cleanPath.replace('/product/', '').trim();
        const found = findProductBySlugOrId(slugOrId, INITIAL_PRODUCTS);
        return found ? enrichProductSpecs(found) : null;
      }
      if (hash.startsWith('#product/')) {
        const slugOrId = hash.replace('#product/', '').trim();
        const found = findProductBySlugOrId(slugOrId, INITIAL_PRODUCTS);
        return found ? enrichProductSpecs(found) : null;
      }
    }
    return null;
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [isAdminViewOpen, setIsAdminViewOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      const hash = window.location.hash.toLowerCase();
      return path === '/admin' || hash === '#admin';
    }
    return false;
  });
  const [activePolicy, setActivePolicy] = useState<string | null>(null);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3800);
  };

  // 1. Initial Test Connection & Auth listener
  useEffect(() => {
    testFirebaseConnection();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setAdminUser(user);
    });

    return () => unsubscribeAuth();
  }, []);

  // 1b. URL Path & Hash synchronization for /admin and Dedicated Product Details Pages (/product/:slug)
  useEffect(() => {
    const handleUrlSync = () => {
      if (typeof window === 'undefined') return;
      const cleanPath = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      const hash = window.location.hash;

      // 1. Direct /admin route or #admin
      if (cleanPath === '/admin' || hash === '#admin') {
        setIsAdminViewOpen(true);
        setSelectedProduct(null);
        return;
      } else {
        setIsAdminViewOpen(false);
      }

      // 2. Dedicated Individual Product Details Page (/product/:slug or #product/:id)
      let productSlugOrId = '';
      if (cleanPath.startsWith('/product/')) {
        productSlugOrId = cleanPath.replace('/product/', '').trim();
      } else if (hash.startsWith('#product/')) {
        productSlugOrId = hash.replace('#product/', '').trim();
      }

      if (productSlugOrId) {
        const found = findProductBySlugOrId(productSlugOrId, products);
        if (found) {
          setSelectedProduct(enrichProductSpecs(found));
          return;
        }
      } else {
        if (cleanPath === '' || cleanPath === '/' || cleanPath === '/index.html') {
          setSelectedProduct(null);
        }
      }
    };

    handleUrlSync();
    window.addEventListener('popstate', handleUrlSync);
    window.addEventListener('hashchange', handleUrlSync);
    return () => {
      window.removeEventListener('popstate', handleUrlSync);
      window.removeEventListener('hashchange', handleUrlSync);
    };
  }, [products]);

  // Keep window.location.pathname synced when isAdminViewOpen changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cleanPath = window.location.pathname.toLowerCase().replace(/\/+$/, '');
    if (isAdminViewOpen) {
      if (cleanPath !== '/admin') {
        window.history.pushState(null, '', '/admin');
      }
    } else {
      if (cleanPath === '/admin') {
        window.history.pushState(null, '', '/');
      }
    }
  }, [isAdminViewOpen]);

  // Keep window.location.pathname synced when selectedProduct changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cleanPath = window.location.pathname.toLowerCase().replace(/\/+$/, '');

    if (selectedProduct) {
      const slug = toProductSlug(selectedProduct);
      const targetPath = `/product/${slug}`;
      if (cleanPath !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (cleanPath.startsWith('/product/')) {
        window.history.pushState(null, '', '/');
      }
    }
  }, [selectedProduct]);

  const openProductPage = (product: Product) => {
    setSelectedProduct(enrichProductSpecs(product));
  };

  const closeProductPage = () => {
    setSelectedProduct(null);
    if (typeof window !== 'undefined') {
      const cleanPath = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      if (cleanPath.startsWith('/product/')) {
        window.history.pushState(null, '', '/');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 2. Real-time Firestore sync for custom/updated products
  useEffect(() => {
    const productsCol = collection(db, 'products');

    const unsubscribe = onSnapshot(
      productsCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const firestoreProducts: Product[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Product;
            firestoreProducts.push(enrichProductSpecs({ ...data, id: docSnap.id }));
          });

          setProducts((prev) => {
            const map = new Map<string, Product>();
            prev.forEach((p) => map.set(p.id, enrichProductSpecs(p)));
            firestoreProducts.forEach((fp) => map.set(fp.id, fp));
            const merged = Array.from(map.values());
            try {
              localStorage.setItem('phonebajar_products', JSON.stringify(merged));
            } catch {
              // ignore
            }
            return merged;
          });
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, 'products');
        } catch {
          // Graceful fallback to local 672-phone catalog if Firestore is temporarily unreachable
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // 2b. Real-time Firestore sync for customer feedback
  useEffect(() => {
    const feedbackCol = collection(db, 'feedback');
    const unsubscribe = onSnapshot(
      feedbackCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: CustomerFeedback[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ ...(docSnap.data() as CustomerFeedback), id: docSnap.id });
          });
          setFeedbacks((prev) => {
            const map = new Map<string, CustomerFeedback>();
            prev.forEach((f) => map.set(f.id, f));
            list.forEach((f) => map.set(f.id, f));
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
        }
      },
      () => {
        // Fallback to localStorage silently if collection rules restrict anonymous read
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync states to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('phonebajar_products', JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('phonebajar_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('phonebajar_wishlist', JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      if (activeExchange) {
        localStorage.setItem('phonebajar_exchange', JSON.stringify(activeExchange));
      } else {
        localStorage.removeItem('phonebajar_exchange');
      }
    } catch {
      // ignore
    }
  }, [activeExchange]);

  useEffect(() => {
    try {
      localStorage.setItem('phonebajar_orders', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('phonebajar_feedbacks', JSON.stringify(feedbacks));
    } catch {
      // ignore
    }
  }, [feedbacks]);

  useEffect(() => {
    try {
      localStorage.setItem('phonebajar_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('phonebajar_accounts', JSON.stringify(registeredAccounts));
    } catch {
      // ignore
    }
  }, [registeredAccounts]);

  useEffect(() => {
    try {
      if (customerAccount) {
        localStorage.setItem('phonebajar_active_account', JSON.stringify(customerAccount));
        localStorage.setItem(
          'phonebajar_customer',
          JSON.stringify({
            fullName: customerAccount.fullName,
            email: customerAccount.email,
            phone: customerAccount.phone
          })
        );
      } else {
        localStorage.removeItem('phonebajar_active_account');
        localStorage.removeItem('phonebajar_customer');
      }
    } catch {
      // ignore
    }
  }, [customerAccount]);

  // Cart calculations (Variant-price aware)
  const cartSubtotal = cart.reduce((sum, item) => {
    const unitPrice = item.variantSellingPrice ?? item.product.sellingPrice;
    return sum + unitPrice * item.quantity;
  }, 0);

  const cartOriginalTotal = cart.reduce((sum, item) => {
    const unitOriginal = item.variantOriginalPrice ?? item.product.originalPrice;
    return sum + unitOriginal * item.quantity;
  }, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Cart Actions
  const addToCart = (
    product: Product,
    quantity = 1,
    selectedStorage?: string,
    selectedColor?: string,
    options?: AddToCartOptions
  ) => {
    const storage = options?.selectedStorage || selectedStorage || product.storage;
    const color = options?.selectedColor || selectedColor || product.color;
    const ram = options?.selectedRam || product.ram;

    // Resolve matching variant if any
    const matchedVariant = product.variants?.find(
      (v) =>
        (options?.selectedVariantId && v.id === options.selectedVariantId) ||
        (v.storage === storage && v.ram === ram)
    );

    const variantSellingPrice =
      options?.variantSellingPrice ?? matchedVariant?.sellingPrice ?? product.sellingPrice;
    const variantOriginalPrice =
      options?.variantOriginalPrice ?? matchedVariant?.originalPrice ?? product.originalPrice;
    const maxStock = matchedVariant?.stock ?? product.stock;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedStorage === storage &&
          (item.selectedRam || item.product.ram) === ram &&
          item.selectedColor === color
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + quantity;
        if (newQty > maxStock) {
          showToast(`Only ${maxStock} units available in stock for this variant.`, 'info');
          updated[existingIndex].quantity = maxStock;
        } else {
          updated[existingIndex].quantity = newQty;
          showToast(`Updated ${product.name} (${ram} / ${storage}) quantity to ${newQty}.`);
        }
        return updated;
      } else {
        showToast(`Added ${product.name} (${ram} / ${storage}, ${color}) to cart.`);
        return [
          ...prevCart,
          {
            product,
            quantity,
            selectedRam: ram,
            selectedStorage: storage,
            selectedColor: color,
            selectedVariantId: matchedVariant?.id || options?.selectedVariantId,
            variantSellingPrice,
            variantOriginalPrice
          }
        ];
      }
    });
  };

  const removeFromCart = (
    productId: string,
    selectedStorage: string,
    selectedColor: string,
    selectedRam?: string
  ) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedStorage === selectedStorage &&
            item.selectedColor === selectedColor &&
            (!selectedRam || (item.selectedRam || item.product.ram) === selectedRam)
          )
      )
    );
    showToast('Item removed from cart.', 'info');
  };

  const updateCartQuantity = (
    productId: string,
    selectedStorage: string,
    selectedColor: string,
    newQty: number,
    selectedRam?: string
  ) => {
    if (newQty <= 0) {
      removeFromCart(productId, selectedStorage, selectedColor, selectedRam);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (
          item.product.id === productId &&
          item.selectedStorage === selectedStorage &&
          item.selectedColor === selectedColor &&
          (!selectedRam || (item.selectedRam || item.product.ram) === selectedRam)
        ) {
          if (newQty > item.product.stock) {
            showToast(`Max stock reached (${item.product.stock} units)`, 'info');
            return { ...item, quantity: item.product.stock };
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist Actions
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to your Wishlist');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Compare Actions
  const toggleCompare = (product: Product) => {
    setCompareList((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        showToast(`Removed ${product.name} from comparison`, 'info');
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 3) {
        showToast('You can compare up to 3 smartphones at a time.', 'info');
        return prev;
      }
      showToast(`Added ${product.name} to compare (${prev.length + 1}/3)`);
      return [...prev, enrichProductSpecs(product)];
    });
  };

  const isInCompare = (productId: string) => compareList.some((p) => p.id === productId);

  const clearCompare = () => {
    setCompareList([]);
  };

  // --- PRODUCT MANAGEMENT WITH FIREBASE SYNC ---
  const addProduct = async (newProdData: Omit<Product, 'id' | 'rating' | 'reviewCount'>): Promise<Product> => {
    const id = `pb_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const nowIso = new Date().toISOString();

    const sanitizedImages = (newProdData.images || []).filter((u) => u && u.trim().length > 0).slice(0, 5);
    const finalImages =
      sanitizedImages.length > 0
        ? sanitizedImages
        : ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80'];

    const rawProduct: Product = {
      ...newProdData,
      id,
      images: finalImages,
      primaryImage: newProdData.primaryImage || finalImages[0],
      rating: 4.8,
      reviewCount: 1,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const newProduct = enrichProductSpecs(rawProduct);

    setProducts((prev) => [newProduct, ...prev]);

    try {
      const docRef = doc(db, 'products', id);
      const firestorePayload = JSON.parse(
        JSON.stringify({
          ...newProduct,
          createdAt: nowIso,
          updatedAt: nowIso
        })
      );
      await setDoc(docRef, firestorePayload);
      showToast(`Product "${newProduct.name}" saved to catalog!`, 'success');
    } catch (err: any) {
      console.warn('Firestore write warning:', err);
      showToast(`Saved to Catalog.`, 'info');
    }

    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
    const nowIso = new Date().toISOString();

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates, updatedAt: nowIso };
          if (updates.originalPrice || updates.sellingPrice) {
            const orig = updates.originalPrice ?? p.originalPrice;
            const sell = updates.sellingPrice ?? p.sellingPrice;
            if (orig > 0 && sell <= orig) {
              updated.discountPercentage = Math.round(((orig - sell) / orig) * 100);
            }
          }
          if (updates.images && updates.images.length > 0) {
            updated.primaryImage = updates.primaryImage || updates.images[0];
          }
          return enrichProductSpecs(updated);
        }
        return p;
      })
    );

    try {
      const docRef = doc(db, 'products', id);
      await setDoc(
        docRef,
        {
          ...updates,
          updatedAt: nowIso,
          serverTimestamp: serverTimestamp()
        },
        { merge: true }
      );
      showToast('Product updated successfully.');
    } catch (err) {
      console.warn('Firestore update warning:', err);
      showToast('Product updated locally.');
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
      showToast('Product deleted.', 'info');
    } catch (err) {
      console.warn('Firestore delete warning:', err);
      showToast('Product removed locally.', 'info');
    }
  };

  const resetProductsToDefault = () => {
    const enriched = INITIAL_PRODUCTS.map((p) => enrichProductSpecs(p));
    setProducts(enriched);
    localStorage.setItem('phonebajar_products', JSON.stringify(enriched));
    showToast(`Catalog reset to ${enriched.length} certified smartphones.`);
  };

  // Order Actions
  const createOrder = (orderInput: Omit<Order, 'id' | 'createdAt'>): Order => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const newOrder: Order = {
      ...orderInput,
      id: `PB-${randomSuffix}`,
      createdAt: new Date().toISOString(),
      trackingId: `IN-EXP-${randomSuffix}`,
      courierPartner: 'BlueDart Express'
    };

    // Deduct stock
    orderInput.items.forEach((item) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === item.product.id) {
            const remaining = Math.max(0, p.stock - item.quantity);
            return { ...p, stock: remaining };
          }
          return p;
        })
      );
    });

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setActiveExchange(null);

    try {
      setDoc(doc(db, 'orders', newOrder.id), JSON.parse(JSON.stringify(newOrder))).catch(() => {});
    } catch {
      // ignore
    }

    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    trackingId?: string,
    courierPartner?: string
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updated = {
            ...order,
            orderStatus: status,
            ...(trackingId ? { trackingId } : {}),
            ...(courierPartner ? { courierPartner } : {})
          };
          try {
            setDoc(doc(db, 'orders', orderId), JSON.parse(JSON.stringify(updated)), { merge: true }).catch(() => {});
          } catch {
            // ignore
          }
          return updated;
        }
        return order;
      })
    );
    showToast(`Order #${orderId} updated to ${status}.`);
  };

  const cancelOrder = (orderId: string, reason?: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updated: Order = {
            ...order,
            orderStatus: 'Cancelled',
            cancellationReason: reason || 'Cancelled by customer before dispatch'
          };
          try {
            setDoc(doc(db, 'orders', orderId), JSON.parse(JSON.stringify(updated)), { merge: true }).catch(() => {});
          } catch {
            // ignore
          }
          return updated;
        }
        return order;
      })
    );
    showToast(`Order #${orderId} has been cancelled.`, 'info');
  };

  const requestOrderReturn = (orderId: string, reason?: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updated: Order = {
            ...order,
            orderStatus: 'Return Requested',
            cancellationReason: reason || '7-Day Replacement / Return requested by customer'
          };
          try {
            setDoc(doc(db, 'orders', orderId), JSON.parse(JSON.stringify(updated)), { merge: true }).catch(() => {});
          } catch {
            // ignore
          }
          return updated;
        }
        return order;
      })
    );
    showToast(`7-Day Replacement / Return request submitted for Order #${orderId}.`);
  };

  const getOrderById = (orderId: string) => {
    const cleanId = orderId.trim().toUpperCase();
    return orders.find(
      (o) =>
        o.id.toUpperCase() === cleanId ||
        o.trackingId?.toUpperCase() === cleanId ||
        o.customer.phone.replace(/\s+/g, '').includes(cleanId.replace(/\s+/g, ''))
    );
  };

  // Customer Feedback & Support Hub Actions
  const submitFeedback = async (input: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    category: FeedbackCategory;
    orderId?: string;
    productName?: string;
    rating?: number;
    subject: string;
    message: string;
  }): Promise<CustomerFeedback> => {
    const id = `FB-${Math.floor(100000 + Math.random() * 900000)}`;
    const newFeedback: CustomerFeedback = {
      id,
      customerName: input.customerName.trim(),
      customerEmail: input.customerEmail.trim(),
      customerPhone: input.customerPhone?.trim() || '',
      category: input.category,
      orderId: input.orderId?.trim() || '',
      productName: input.productName?.trim() || '',
      rating: input.rating || 5,
      subject: input.subject.trim(),
      message: input.message.trim(),
      status: 'Submitted',
      createdAt: new Date().toISOString()
    };

    setFeedbacks((prev) => [newFeedback, ...prev]);

    try {
      await setDoc(doc(db, 'feedback', id), JSON.parse(JSON.stringify(newFeedback)));
    } catch {
      // Stored locally if Firestore rule blocks anonymous write
    }

    showToast(`Your ${input.category.toLowerCase()} (#${id}) has been submitted!`);
    return newFeedback;
  };

  const updateFeedbackStatus = async (
    feedbackId: string,
    status: 'Submitted' | 'In Review' | 'Resolved',
    adminReply?: string
  ): Promise<void> => {
    setFeedbacks((prev) =>
      prev.map((f) => {
        if (f.id === feedbackId) {
          const updated: CustomerFeedback = {
            ...f,
            status,
            ...(adminReply !== undefined ? { adminReply } : {})
          };
          try {
            setDoc(doc(db, 'feedback', feedbackId), JSON.parse(JSON.stringify(updated)), { merge: true }).catch(
              () => {}
            );
          } catch {
            // ignore
          }
          return updated;
        }
        return f;
      })
    );
    showToast(`Support ticket #${feedbackId} marked as ${status}.`);
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Store settings updated.');
  };

  // Admin PIN Auth
  const loginAdminWithPin = (pin: string): boolean => {
    const entered = pin.trim();
    if (entered === settings.managerPin || entered === '8521553950') {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('phonebajar_admin_auth', 'true');
      showToast('Manager access granted.');
      return true;
    }
    showToast('Invalid Manager PIN.', 'error');
    return false;
  };

  // Admin Google Auth via Firebase
  const loginAdminWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      setAdminUser(result.user);
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('phonebajar_admin_auth', 'true');
      showToast(`Authenticated as ${result.user.displayName || result.user.email}!`);
      return true;
    } catch (err: any) {
      console.warn('Firebase Google Sign-In error:', err);
      showToast(err.message || 'Google sign-in canceled.', 'error');
      return false;
    }
  };

  const logoutAdmin = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setAdminUser(null);
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('phonebajar_admin_auth');
    setIsAdminViewOpen(false);
    showToast('Manager logged out.', 'info');
  };

  // Customer Account Methods
  const loginCustomer = (fullName: string, email: string, phone: string) => {
    const existing = registeredAccounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() || (phone && a.phone === phone)
    );
    if (existing) {
      const updated = { ...existing, fullName: fullName || existing.fullName, phone: phone || existing.phone };
      setCustomerAccount(updated);
      showToast(`Welcome back, ${updated.fullName}!`);
      return;
    }
    const newAcc: CustomerAccount = {
      id: `cust_${Date.now()}`,
      fullName,
      email,
      phone,
      savedAddresses: [],
      createdAt: new Date().toISOString()
    };
    setRegisteredAccounts((prev) => [...prev, newAcc]);
    setCustomerAccount(newAcc);
    showToast(`Welcome to Phone Bazar, ${fullName}!`);
  };

  const registerCustomer = (fullName: string, email: string, phone: string, password: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const exists = registeredAccounts.some((a) => a.email.toLowerCase() === cleanEmail);
    if (exists) {
      showToast('An account with this email already exists. Please sign in.', 'error');
      return false;
    }
    const newAcc: CustomerAccount = {
      id: `cust_${Date.now()}`,
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      passwordHash: btoa(password),
      savedAddresses: [],
      createdAt: new Date().toISOString()
    };
    setRegisteredAccounts((prev) => [...prev, newAcc]);
    setCustomerAccount(newAcc);
    showToast(`Account created! Welcome to Phone Bazar, ${newAcc.fullName}.`);
    return true;
  };

  const loginCustomerWithCredentials = (emailOrPhone: string, password: string): boolean => {
    const query = emailOrPhone.trim().toLowerCase();
    const found = registeredAccounts.find(
      (a) =>
        a.email.toLowerCase() === query ||
        a.phone.replace(/\s+/g, '') === query.replace(/\s+/g, '')
    );
    if (!found) {
      showToast('No account found with that email or phone. Please register first.', 'error');
      return false;
    }
    if (found.passwordHash && found.passwordHash !== btoa(password)) {
      showToast('Incorrect password. Please try again or use Forgot Password.', 'error');
      return false;
    }
    setCustomerAccount(found);
    showToast(`Welcome back, ${found.fullName}!`);
    return true;
  };

  const loginCustomerWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
      const email = (user.email || '').toLowerCase();
      const fullName = user.displayName || 'Phone Bazar Customer';
      const phone = user.phoneNumber || '';

      const existing = registeredAccounts.find((a) => a.email.toLowerCase() === email);
      if (existing) {
        setCustomerAccount(existing);
      } else {
        const newAcc: CustomerAccount = {
          id: `cust_${user.uid}`,
          fullName,
          email,
          phone,
          savedAddresses: [],
          createdAt: new Date().toISOString()
        };
        setRegisteredAccounts((prev) => [...prev, newAcc]);
        setCustomerAccount(newAcc);
      }
      showToast(`Signed in as ${fullName}`);
      return true;
    } catch (err: any) {
      showToast(err.message || 'Google Sign-In could not be completed.', 'error');
      return false;
    }
  };

  const resetCustomerPassword = (email: string, newPassword: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const idx = registeredAccounts.findIndex((a) => a.email.toLowerCase() === cleanEmail);
    if (idx === -1) {
      showToast('No registered account found with that email address.', 'error');
      return false;
    }
    const updated = [...registeredAccounts];
    updated[idx] = { ...updated[idx], passwordHash: btoa(newPassword) };
    setRegisteredAccounts(updated);
    showToast('Password updated successfully! You can now sign in.');
    return true;
  };

  const updateCustomerProfile = (updates: { fullName: string; email: string; phone: string }) => {
    if (!customerAccount) return;
    const updatedAcc: CustomerAccount = {
      ...customerAccount,
      fullName: updates.fullName.trim(),
      email: updates.email.trim().toLowerCase(),
      phone: updates.phone.trim()
    };
    setCustomerAccount(updatedAcc);
    setRegisteredAccounts((prev) => prev.map((a) => (a.id === updatedAcc.id ? updatedAcc : a)));
    showToast('Profile details updated.');
  };

  const saveCustomerAddress = (address: CustomerDetails) => {
    if (!customerAccount) return;
    const updatedAcc: CustomerAccount = {
      ...customerAccount,
      savedAddresses: [...(customerAccount.savedAddresses || []), address]
    };
    setCustomerAccount(updatedAcc);
    setRegisteredAccounts((prev) => prev.map((a) => (a.id === updatedAcc.id ? updatedAcc : a)));
    showToast('Delivery address saved to your account.');
  };

  const deleteCustomerAddress = (index: number) => {
    if (!customerAccount) return;
    const updatedAcc: CustomerAccount = {
      ...customerAccount,
      savedAddresses: customerAccount.savedAddresses.filter((_, i) => i !== index)
    };
    setCustomerAccount(updatedAcc);
    setRegisteredAccounts((prev) => prev.map((a) => (a.id === updatedAcc.id ? updatedAcc : a)));
    showToast('Address removed.', 'info');
  };

  const logoutCustomer = () => {
    setCustomerAccount(null);
    showToast('Signed out of customer account.', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        resetProductsToDefault,

        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartOriginalTotal,
        cartCount,

        wishlist,
        toggleWishlist,
        isInWishlist,

        compareList,
        toggleCompare,
        isInCompare,
        clearCompare,
        isCompareModalOpen,
        setIsCompareModalOpen,

        activeExchange,
        setActiveExchange,
        isExchangeModalOpen,
        setIsExchangeModalOpen,

        orders,
        createOrder,
        updateOrderStatus,
        cancelOrder,
        requestOrderReturn,
        getOrderById,

        feedbacks,
        submitFeedback,
        updateFeedbackStatus,

        settings,
        updateSettings,

        isAdminLoggedIn,
        adminUser,
        loginAdminWithPin,
        loginAdminWithGoogle,
        logoutAdmin,

        customer,
        customerAccount,
        loginCustomer,
        registerCustomer,
        loginCustomerWithCredentials,
        loginCustomerWithGoogle,
        resetCustomerPassword,
        updateCustomerProfile,
        saveCustomerAddress,
        deleteCustomerAddress,
        logoutCustomer,
        isAccountModalOpen,
        setIsAccountModalOpen,
        accountModalTab,
        setAccountModalTab,
        openAccountModal,

        selectedProduct,
        setSelectedProduct,
        openProductPage,
        closeProductPage,

        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isOrderTrackingOpen,
        setIsOrderTrackingOpen,
        isAdminViewOpen,
        setIsAdminViewOpen,
        activePolicy,
        setActivePolicy,

        toast,
        showToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
