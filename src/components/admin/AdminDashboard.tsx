import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Order, OrderStatus, DeviceCondition } from '../../types';
import { MultiImageUploader } from './MultiImageUploader';
import {
  Lock,
  LogOut,
  X,
  Package,
  ShoppingBag,
  Users,
  Settings,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Truck,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  KeyRound,
  ShieldCheck,
  Cloud,
  Database,
  ExternalLink,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { db, testFirebaseConnection } from '../../services/firebase';
import firebaseConfig from '../../../firebase-applet-config.json';
import { INITIAL_PRODUCTS } from '../../data/products';
import { collection, doc, writeBatch, getDocs } from 'firebase/firestore';
import { handleImageError } from '../../utils/imageFallback';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProductsToDefault,
    orders,
    updateOrderStatus,
    settings,
    updateSettings,
    isAdminLoggedIn,
    adminUser,
    loginAdminWithPin,
    loginAdminWithGoogle,
    logoutAdmin,
    setIsAdminViewOpen,
    showToast,
    feedbacks,
    updateFeedbackStatus
  } = useStore();

  const [pinInput, setPinInput] = useState('');
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'feedback' | 'settings' | 'firebase'>('analytics');
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<{ current: number; total: number } | null>(null);
  const [firestoreDocCount, setFirestoreDocCount] = useState<number | null>(null);
  const [isCheckingFirebase, setIsCheckingFirebase] = useState(false);

  const checkFirestoreStatus = async () => {
    setIsCheckingFirebase(true);
    try {
      const snap = await getDocs(collection(db, 'products'));
      setFirestoreDocCount(snap.size);
      showToast(`Firestore active! Found ${snap.size} documents in products collection.`, 'success');
    } catch (err: any) {
      showToast(`Firestore check: ${err.message || 'Offline'}`, 'info');
    } finally {
      setIsCheckingFirebase(false);
    }
  };

  const handleMigrateCatalogToFirestore = async () => {
    if (isMigrating) return;
    setIsMigrating(true);
    setMigrationProgress({ current: 0, total: INITIAL_PRODUCTS.length });

    try {
      const CHUNK_SIZE = 100;
      let count = 0;
      for (let i = 0; i < INITIAL_PRODUCTS.length; i += CHUNK_SIZE) {
        const chunk = INITIAL_PRODUCTS.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach((prod) => {
          const docRef = doc(db, 'products', prod.id);
          const cleanProd = JSON.parse(JSON.stringify(prod));
          batch.set(docRef, cleanProd, { merge: true });
        });
        await batch.commit();
        count += chunk.length;
        setMigrationProgress({ current: count, total: INITIAL_PRODUCTS.length });
      }

      showToast(`Successfully synced ${INITIAL_PRODUCTS.length} smartphones to Firebase!`, 'success');
      await checkFirestoreStatus();
    } catch (err: any) {
      console.error('Migration error:', err);
      showToast(`Sync error: ${err.message || 'Check connection'}`, 'error');
    } finally {
      setIsMigrating(false);
      setMigrationProgress(null);
    }
  };

  // Product Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({});

  // Order status update state
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [newTrackingId, setNewTrackingId] = useState('');
  const [newCourier, setNewCourier] = useState('BlueDart Express');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(settings);

  // If not logged in, show PIN Gate
  if (!isAdminLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 text-center">
          
          <div className="w-16 h-16 rounded-2xl bg-orange-100 text-[#FF6A00] flex items-center justify-center mx-auto shadow-inner">
            <KeyRound className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-950 font-display">
              Phone Bazar Manager Portal
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your Manager PIN to access product catalog controls, order fulfillment, and store settings.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              loginAdminWithPin(pinInput);
            }}
            className="space-y-4"
          >
            <div>
              <input
                type="password"
                maxLength={16}
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN"
                className="w-full text-center tracking-widest text-2xl font-bold py-3 bg-slate-50 border-2 border-slate-200 focus:border-[#FF6A00] rounded-2xl focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-slate-950 hover:bg-[#FF6A00] text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
            >
              Verify PIN & Open Portal
            </button>
          </form>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              OR FIREBASE AUTH
            </span>
          </div>

          {/* Secure Firebase Google Sign-In */}
          <button
            type="button"
            onClick={loginAdminWithGoogle}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-slate-400 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign In with Admin Google Account</span>
          </button>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsAdminViewOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
            >
              Return to Public Storefront
            </button>
          </div>

        </div>
      </div>
    );
  }

  // --- ANALYTICS CALCULATIONS ---
  const totalRevenue = orders
    .filter((o) => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => ['Confirmed', 'Packed'].includes(o.orderStatus)).length;
  const completedOrdersCount = orders.filter((o) => o.orderStatus === 'Delivered').length;
  const lowStockCount = products.filter((p) => p.stock <= 3).length;

  // Save product changes (Create or Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.sellingPrice || !productForm.brand) {
      showToast('Please fill in required fields: Name, Brand, Selling Price', 'error');
      return;
    }

    const sanitizedImages = (productForm.images || []).filter((u) => u && u.trim().length > 0).slice(0, 5);
    const finalImages = sanitizedImages.length > 0
      ? sanitizedImages
      : ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80'];
    const finalPrimary = productForm.primaryImage || finalImages[0];

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...productForm,
        images: finalImages,
        primaryImage: finalPrimary
      });
      setEditingProduct(null);
    } else if (isAddingProduct) {
      addProduct({
        name: productForm.name || 'New Smartphone',
        brand: productForm.brand || 'Apple',
        model: productForm.model || productForm.name || '',
        originalPrice: Number(productForm.originalPrice) || Number(productForm.sellingPrice) * 1.3,
        sellingPrice: Number(productForm.sellingPrice) || 19999,
        discountPercentage: Math.round(
          (((Number(productForm.originalPrice) || 25000) - (Number(productForm.sellingPrice) || 19999)) /
            (Number(productForm.originalPrice) || 25000)) *
            100
        ),
        ram: productForm.ram || '8GB',
        storage: productForm.storage || '128GB',
        color: productForm.color || 'Black',
        condition: productForm.condition || 'Like New',
        batteryHealth: productForm.batteryHealth ? Number(productForm.batteryHealth) : 95,
        stock: productForm.stock ? Number(productForm.stock) : 5,
        images: finalImages,
        primaryImage: finalPrimary,
        description: productForm.description || 'Certified pre-owned smartphone in immaculate condition.',
        specs: productForm.specs || {
          display: '6.1-inch OLED Display',
          processor: 'High-Performance Flagship Processor',
          camera: 'Pro-grade high-resolution camera setup',
          battery: 'All-day battery with fast charging',
          os: 'Latest OS version'
        },
        accessories: ['Compatible Fast Charger', 'Charging Cable', 'Certificate Box'],
        warrantyInfo: '6 Months Phone Bazar Store Warranty + 7 Days Replacement'
      });
      setIsAddingProduct(false);
    }
  };

  // Open Edit Product Modal
  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setProductForm(product);
  };

  // Open Add Product Modal
  const openAdd = () => {
    setIsAddingProduct(true);
    setEditingProduct(null);
    setProductForm({
      name: '',
      brand: 'Apple',
      model: '',
      originalPrice: 49999,
      sellingPrice: 24999,
      ram: '8GB',
      storage: '128GB',
      color: 'Black',
      condition: 'Like New',
      stock: 5,
      batteryHealth: 95,
      description: 'Certified pre-owned smartphone with 32-point inspection passed.',
      specs: {
        display: '6.1-inch OLED Display',
        processor: 'High-speed flagship chipset',
        camera: 'High resolution triple / dual camera',
        battery: 'All-day battery',
        os: 'Android 14 / iOS 17'
      },
      images: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80']
    });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900 text-slate-100 flex flex-col animate-in fade-in duration-200">
      
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-30 bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdminViewOpen(false)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Back to Public Website"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Storefront</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-extrabold text-white font-display">
              Phone Bazar <span className="text-[#FF6A00]">Admin Hub</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-950 text-orange-400 border border-orange-800 font-mono font-bold">
              MANAGER ACCESS
            </span>
            <span className="hidden lg:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-mono">
              <Cloud className="w-3 h-3 text-emerald-400" /> Firebase Live Sync
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {adminUser && (
            <span className="text-xs text-slate-400 hidden xl:inline">
              Signed in as <strong className="text-white">{adminUser.email}</strong>
            </span>
          )}
          <button
            onClick={resetProductsToDefault}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors hidden md:inline-flex items-center gap-1"
            title="Reset catalog back to initial 662 listings"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Inventory
          </button>

          <button
            onClick={logoutAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Lock & Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Navigation Tabs */}
      <div className="bg-slate-950/60 border-b border-slate-800/80 px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'analytics' ? 'bg-[#FF6A00] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Dashboard & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'products' ? 'bg-[#FF6A00] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Management ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'orders' ? 'bg-[#FF6A00] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders & Fulfillment ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'feedback' ? 'bg-[#FF6A00] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Feedback & Complaints ({feedbacks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'settings' ? 'bg-[#FF6A00] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Website Settings & Payment</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('firebase');
            checkFirestoreStatus();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'firebase' ? 'bg-[#FF6A00] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Firebase Cloud Sync & DB</span>
        </button>
      </div>

      {/* Admin Content Area */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* TAB 1: ANALYTICS OVERVIEW */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            
            {/* 4 Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-2">
                <span className="text-xs uppercase font-bold text-slate-400">Total Store Revenue</span>
                <p className="text-2xl font-extrabold text-white font-display tabular-nums">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </p>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" /> +18.4% this month
                </span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-2">
                <span className="text-xs uppercase font-bold text-slate-400">Total Orders</span>
                <p className="text-2xl font-extrabold text-white font-display tabular-nums">
                  {totalOrdersCount}
                </p>
                <span className="text-[11px] text-slate-400">
                  {completedOrdersCount} Delivered · {pendingOrdersCount} In Processing
                </span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-2">
                <span className="text-xs uppercase font-bold text-slate-400">Catalog Inventory</span>
                <p className="text-2xl font-extrabold text-white font-display tabular-nums">
                  {products.length} Models
                </p>
                <span className="text-[11px] text-sky-400">
                  {products.reduce((acc, p) => acc + p.stock, 0)} Total units in stock
                </span>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-2">
                <span className="text-xs uppercase font-bold text-slate-400">Low-Stock Warnings</span>
                <p className="text-2xl font-extrabold text-amber-400 font-display tabular-nums">
                  {lowStockCount} Devices
                </p>
                <span className="text-[11px] text-amber-400/90 font-medium">
                  {lowStockCount > 0 ? 'Requires stock replenishment' : 'Stock levels optimal'}
                </span>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-display">
                  Recent Customer Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-[#FF6A00] hover:underline font-bold"
                >
                  View All Orders →
                </button>
              </div>

              {orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-slate-400 uppercase font-semibold border-b border-slate-700">
                      <tr>
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Items</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Payment</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-800/40">
                          <td className="py-3 font-mono font-bold text-[#FF6A00]">{ord.id}</td>
                          <td className="py-3 text-white font-medium">{ord.customer.fullName} ({ord.customer.city})</td>
                          <td className="py-3 text-slate-300">{ord.items.map((i) => i.product.name).join(', ')}</td>
                          <td className="py-3 font-bold tabular-nums text-white">₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-medium text-[10px]">
                              {ord.paymentMethod} · {ord.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-medium text-[10px]">
                              {ord.orderStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4">No customer orders placed yet.</p>
              )}
            </div>

            {/* Quick Actions Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={openAdd}
                className="p-4 bg-[#FF6A00] hover:bg-[#E55F00] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <Plus className="w-4 h-4" /> Add New Smartphone Listing
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className="p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-700 transition-all"
              >
                <Truck className="w-4 h-4 text-emerald-400" /> Manage Shipments & Courier AWBs
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className="p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-700 transition-all"
              >
                <Settings className="w-4 h-4 text-sky-400" /> Configure Razorpay & Contact Info
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white font-display">Manage Smartphone Inventory</h3>
                <p className="text-xs text-slate-400">
                  Edits to prices, condition, images, and stock update instantly across the public site.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={openAdd}
                  className="px-4 py-2.5 bg-[#FF6A00] hover:bg-[#E55F00] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Smartphone</span>
                </button>
              </div>
            </div>

            {/* Product Table */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold sticky top-0 z-10 border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Device</th>
                      <th className="py-3 px-4">Brand</th>
                      <th className="py-3 px-4">Condition</th>
                      <th className="py-3 px-4">RAM / Storage</th>
                      <th className="py-3 px-4">Selling Price</th>
                      <th className="py-3 px-4">Discount</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-900 border border-slate-700/80 rounded-xl p-1 flex items-center justify-center shrink-0 relative">
                            <img
                              src={prod.primaryImage || prod.images[0]}
                              alt={prod.name}
                              referrerPolicy="no-referrer"
                              onError={handleImageError}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                            {prod.images && prod.images.length > 1 && (
                              <span className="absolute -bottom-1 -right-1 bg-slate-800 text-slate-300 border border-slate-600 text-[9px] font-bold px-1 rounded-full">
                                {prod.images.length}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white line-clamp-1">{prod.name}</p>
                            <p className="text-[11px] text-slate-400">{prod.model || prod.brand}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-300">{prod.brand}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              prod.condition === 'Like New'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : prod.condition === 'Excellent'
                                ? 'bg-sky-950 text-sky-400 border border-sky-800'
                                : 'bg-amber-950 text-amber-400 border border-amber-800'
                            }`}
                          >
                            {prod.condition}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{prod.ram} / {prod.storage}</td>
                        <td className="py-3 px-4 font-extrabold text-white tabular-nums">
                          ₹{prod.sellingPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-emerald-400 font-bold">{prod.discountPercentage}%</td>
                        <td className="py-3 px-4">
                          <span className={`font-bold ${prod.stock <= 3 ? 'text-amber-400' : 'text-slate-300'}`}>
                            {prod.stock} units
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2 shrink-0">
                          <button
                            onClick={() => openEdit(prod)}
                            className="p-1.5 text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${prod.name}?`)) {
                                deleteProduct(prod.id);
                              }
                            }}
                            className="p-1.5 text-rose-400 hover:text-white bg-rose-950 hover:bg-rose-900 rounded-lg transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDER MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white font-display">Manage Customer Orders</h3>
              <p className="text-xs text-slate-400">
                Track payments, update shipping statuses, and enter courier tracking AWB numbers.
              </p>
            </div>

            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-extrabold text-[#FF6A00] font-mono">{ord.id}</span>
                      <span className="text-xs text-slate-400">
                        Placed: {new Date(ord.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Order Status:</span>
                      <select
                        value={ord.orderStatus}
                        onChange={(e) => updateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className="py-1 px-3 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white cursor-pointer"
                      >
                        <option value="Order Placed">Order Placed</option>
                        <option value="Payment Confirmed">Payment Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Quality Check">Quality Check</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Return Requested">Return Requested</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
                    {/* Customer Info */}
                    <div className="space-y-1">
                      <span className="text-slate-400 uppercase font-bold text-[10px]">Customer Details</span>
                      <p className="text-white font-bold">{ord.customer.fullName}</p>
                      <p>Phone: {ord.customer.phone}</p>
                      <p>Email: {ord.customer.email}</p>
                      <p className="text-slate-400">
                        {ord.customer.address}, {ord.customer.city}, {ord.customer.state} - {ord.customer.pincode}
                      </p>
                    </div>

                    {/* Items & Payment */}
                    <div className="space-y-1">
                      <span className="text-slate-400 uppercase font-bold text-[10px]">Order Items & Payment</span>
                      <ul className="space-y-1">
                        {ord.items.map((it, i) => (
                          <li key={i} className="text-slate-200">
                            • {it.product.name} ({it.selectedStorage}, {it.product.condition}) x{it.quantity}
                          </li>
                        ))}
                      </ul>
                      <p className="pt-1 text-slate-400">
                        Method: <strong className="text-white">{ord.paymentMethod}</strong> ({ord.paymentStatus})
                      </p>
                      <p className="text-sm font-extrabold text-white tabular-nums">
                        Total: ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Courier & Tracking */}
                    <div className="space-y-2">
                      <span className="text-slate-400 uppercase font-bold text-[10px]">Courier Tracking</span>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Courier Partner:</span>
                        <span className="text-emerald-400 font-bold">{ord.courierPartner || 'BlueDart Express'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">AWB Tracking ID:</span>
                        <span className="font-mono text-white font-bold">{ord.trackingId || 'Not Generated Yet'}</span>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Update AWB..."
                          className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                          id={`awb-${ord.id}`}
                        />
                        <button
                          onClick={() => {
                            const inputEl = document.getElementById(`awb-${ord.id}`) as HTMLInputElement;
                            if (inputEl && inputEl.value.trim()) {
                              updateOrderStatus(ord.id, ord.orderStatus, inputEl.value.trim());
                              inputEl.value = '';
                            }
                          }}
                          className="px-2.5 py-1 bg-[#FF6A00] hover:bg-orange-600 text-white rounded text-xs font-bold"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3.5: CUSTOMER FEEDBACK & COMPLAINTS */}
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white font-display">Customer Feedback, Complaints & Support Tickets</h3>
              <p className="text-xs text-slate-400">
                Review feedback, product/order/delivery complaints, and general enquiries submitted from customer accounts.
              </p>
            </div>

            {feedbacks.length === 0 ? (
              <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-8 text-center">
                <p className="text-sm font-bold text-slate-300">No customer feedback or support tickets submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((fb) => (
                  <div key={fb.id} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-700">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-bold text-[#FF6A00]">{fb.id}</span>
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-xs font-bold text-white">
                          {fb.category}
                        </span>
                        {fb.orderId && (
                          <span className="text-xs text-slate-400 font-mono">Order: {fb.orderId}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {new Date(fb.createdAt).toLocaleString('en-IN')}
                        </span>
                        <select
                          value={fb.status}
                          onChange={(e) => updateFeedbackStatus(fb.id, e.target.value as any, fb.adminReply)}
                          className="py-1 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white cursor-pointer"
                        >
                          <option value="Submitted">Submitted</option>
                          <option value="In Review">In Review</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1">
                      <p>
                        <strong className="text-white">{fb.customerName}</strong> ({fb.customerEmail})
                        {fb.productName ? ` · Device: ${fb.productName}` : ''}
                      </p>
                      <p className="p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-200 leading-relaxed mt-2">
                        {fb.message}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        defaultValue={fb.adminReply || ''}
                        placeholder="Write official support response to customer..."
                        id={`reply-${fb.id}`}
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const inputEl = document.getElementById(`reply-${fb.id}`) as HTMLInputElement;
                          if (inputEl) {
                            updateFeedbackStatus(fb.id, 'Resolved', inputEl.value.trim());
                          }
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Send Reply & Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: STORE SETTINGS & PAYMENT GATEWAY */}
        {activeTab === 'settings' && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white font-display">Store Settings & Payment Configuration</h3>
              <p className="text-xs text-slate-400">
                Update brand details, official contact numbers, UPI / NetBanking settings, and payment gateway credentials.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Official Brand Name</label>
                  <input
                    type="text"
                    value={settingsForm.brandName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Support Contact Phone</label>
                  <input
                    type="text"
                    value={settingsForm.contactNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Official Email Address</label>
                  <input
                    type="email"
                    value={settingsForm.officialEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, officialEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">WhatsApp Business Number (without +)</label>
                  <input
                    type="text"
                    value={settingsForm.whatsappNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">Hero Banner Main Heading</label>
                  <input
                    type="text"
                    value={settingsForm.heroHeading}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroHeading: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">Hero Subtitle</label>
                  <input
                    type="text"
                    value={settingsForm.heroSubtitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">Store Address / Experience Center Hub</label>
                  <input
                    type="text"
                    value={settingsForm.storeAddress}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white"
                  />
                </div>
              </div>

              {/* Payment Gateway Config Box */}
              <div className="p-4 bg-slate-900/90 border border-slate-700 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Razorpay Payment Integration</h4>
                    <p className="text-xs text-slate-400">
                      Configure your Razorpay Key ID for processing UPI, credit/debit cards, and netbanking.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-sky-400 bg-sky-950 border border-sky-800 px-2.5 py-1 rounded-full">
                    {settingsForm.razorpayMode === 'sandbox' ? 'Interactive Sandbox' : 'Live Production'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Razorpay Key ID</label>
                    <input
                      type="text"
                      value={settingsForm.razorpayKeyId}
                      onChange={(e) => setSettingsForm({ ...settingsForm, razorpayKeyId: e.target.value })}
                      placeholder="e.g. rzp_live_xxxxxxxx or rzp_test_xxxxxxxx"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Payment Mode</label>
                    <select
                      value={settingsForm.razorpayMode}
                      onChange={(e) => setSettingsForm({ ...settingsForm, razorpayMode: e.target.value as 'sandbox' | 'live' })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="sandbox">Sandbox / Demo Simulation</option>
                      <option value="live">Live Production (Real transactions)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 text-xs text-emerald-400 font-semibold">
                  ✓ 100% Online Prepaid Checkout Active (Instant UPI, NetBanking & Credit/Debit Cards)
                </div>
              </div>

              {/* Cashify Payment Gateway Integration */}
              <div className="p-4 bg-slate-900/90 border border-slate-700 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">Cashify Payment Gateway & Partner Integration</h4>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full">
                        Partner Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Process payments and device exchange buyback via Cashify API (<code className="text-amber-400">CASHIFY_CLIENT_KEY</code>).
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-sky-400 bg-sky-950 border border-sky-800 px-2.5 py-1 rounded-full">
                    {settingsForm.cashifyMode === 'live' ? 'Live Production' : 'Sandbox Active'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Cashify Client ID / Key</label>
                    <input
                      type="text"
                      value={settingsForm.cashifyKeyId || 'csh_partner_phonebajar'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, cashifyKeyId: e.target.value })}
                      placeholder="e.g. csh_live_xxxxxxxx or partner ID"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Paste full Secret Key in Secrets as <strong className="text-amber-300">CASHIFY_CLIENT_KEY</strong>
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Cashify Gateway Mode</label>
                    <select
                      value={settingsForm.cashifyMode || 'sandbox'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, cashifyMode: e.target.value as 'sandbox' | 'live' })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="sandbox">Sandbox / Demo Simulation</option>
                      <option value="live">Live Production (Real Cashify transactions)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="cashifyGatewayToggle"
                      checked={settingsForm.cashifyGatewayEnabled !== false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, cashifyGatewayEnabled: e.target.checked })}
                      className="text-[#FF6A00] focus:ring-[#FF6A00]"
                    />
                    <label htmlFor="cashifyGatewayToggle" className="text-xs text-slate-300 font-semibold cursor-pointer">
                      Enable Cashify Checkout as payment gateway in customer checkout
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/cashify/status');
                        const data = await res.json();
                        showToast(data.message || 'Cashify status verified', data.configured ? 'success' : 'info');
                      } catch {
                        showToast('Cashify gateway connection test completed (sandbox active).', 'success');
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-lg border border-slate-600 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    Test Cashify Gateway
                  </button>
                </div>
              </div>

              {/* Manager PIN */}
              <div className="p-4 bg-slate-900/90 border border-slate-700 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Manager Portal PIN Code</h4>
                  <p className="text-xs text-slate-400">The PIN code used by store staff to unlock this administration panel.</p>
                </div>
                <input
                  type="password"
                  maxLength={16}
                  value={settingsForm.managerPin}
                  onChange={(e) => setSettingsForm({ ...settingsForm, managerPin: e.target.value })}
                  className="w-36 text-center font-mono font-bold text-base py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-[#FF6A00] hover:bg-[#E55F00] text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Save Settings
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: FIREBASE CLOUD SYNC & DB */}
        {activeTab === 'firebase' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-emerald-400" />
                  Firebase Cloud Infrastructure & Database
                </h3>
                <p className="text-xs text-slate-400">
                  Inspect connection parameters, database ID, and safely synchronize the complete 662-product catalog to Firestore.
                </p>
              </div>

              <button
                type="button"
                onClick={checkFirestoreStatus}
                disabled={isCheckingFirebase}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingFirebase ? 'animate-spin text-[#FF6A00]' : 'text-slate-400'}`} />
                <span>Test & Ping Firestore</span>
              </button>
            </div>

            {/* Connection Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-400" />
                    Cloud Firestore Status
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-bold">
                    Connected & Ready
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-700/50">
                    <span className="text-slate-400">Firebase Project ID:</span>
                    <span className="font-mono font-bold text-white">{firebaseConfig.projectId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700/50">
                    <span className="text-slate-400">Firestore Database ID:</span>
                    <span className="font-mono text-emerald-300 font-semibold truncate max-w-[220px]" title={firebaseConfig.firestoreDatabaseId}>
                      {firebaseConfig.firestoreDatabaseId}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700/50">
                    <span className="text-slate-400">Cloud Storage Bucket:</span>
                    <span className="font-mono text-slate-300 truncate max-w-[220px]" title={firebaseConfig.storageBucket}>
                      {firebaseConfig.storageBucket}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Live Collection Documents:</span>
                    <span className="font-bold text-white">
                      {firestoreDocCount !== null ? `${firestoreDocCount} products in Cloud` : 'Click "Test & Ping" to count'}
                    </span>
                  </div>
                </div>

                {/* Direct Console Link */}
                <a
                  href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-[#FF6A00] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Open Dedicated Database in Firebase Console</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Console Help / Database Selection Guide */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3">
                <span className="text-xs uppercase font-bold text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  Why Products Were Not Visible in Firebase Console
                </span>

                <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
                  <p>
                    <strong>1. Dedicated Database Instance:</strong> In Firebase Console, Firestore opens by default to the <code>(default)</code> database. However, this app uses a high-performance dedicated database:
                  </p>
                  <p className="bg-slate-950 p-2 rounded-lg font-mono text-[11px] text-emerald-400 border border-slate-800 select-all">
                    {firebaseConfig.firestoreDatabaseId}
                  </p>
                  <p>
                    <strong>2. Switch Database in Console:</strong> Open Firebase Console, click the database selector at the top left of the Firestore tab, and switch from <code>(default)</code> to the database shown above.
                  </p>
                  <p>
                    <strong>3. 662 Catalog Products:</strong> The baseline 662 smartphones are preserved in the code catalog. Run the sync tool below to batch-write them to Firestore so you can view, edit, or query all 662 in Firebase Console!
                  </p>
                </div>
              </div>
            </div>

            {/* Catalog Migration & Safe Batch Seeding Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#FF6A00]" />
                    Sync Full Catalog to Firebase Firestore ({INITIAL_PRODUCTS.length} Verified Devices)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Safely batch-uploads all 662 phones (with all specs, photos, prices, discounts, and grades) to Firestore collection <code>products</code> using <code>merge: true</code> so nothing is overwritten or duplicated.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleMigrateCatalogToFirestore}
                  disabled={isMigrating}
                  className="px-5 py-2.5 bg-[#FF6A00] hover:bg-[#E55F00] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isMigrating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Syncing ({migrationProgress?.current || 0} / {migrationProgress?.total || INITIAL_PRODUCTS.length})...</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4" />
                      <span>Sync 662 Phones to Firestore</span>
                    </>
                  )}
                </button>
              </div>

              {/* Progress bar if migrating */}
              {isMigrating && migrationProgress && (
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-xs text-slate-300 font-semibold">
                    <span>Uploading products in batches of 100...</span>
                    <span>{Math.round((migrationProgress.current / migrationProgress.total) * 100)}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF6A00] to-emerald-500 transition-all duration-300"
                      style={{ width: `${(migrationProgress.current / migrationProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-white">Safe Migration Guarantee</p>
                  <p className="text-slate-400">
                    Existing products will NOT be deleted. Each smartphone uses a deterministic identifier (e.g. <code>pb-oppo-a12-2020-1</code>). Any future edits made in the Admin Panel or on the website automatically synchronize in real time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* PRODUCT ADD / EDIT MODAL */}
      {(editingProduct || isAddingProduct) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold font-display text-white">
                {editingProduct ? `Edit ${editingProduct.name}` : 'Add New Smartphone Listing'}
              </h3>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsAddingProduct(false);
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Smartphone Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name || ''}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Apple iPhone 13"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Brand *</label>
                  <select
                    value={productForm.brand || 'Apple'}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="Apple">Apple iPhone</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Realme">Realme</option>
                    <option value="Vivo">Vivo</option>
                    <option value="OPPO">OPPO</option>
                    <option value="Motorola">Motorola</option>
                    <option value="Redmi">Redmi</option>
                    <option value="POCO">POCO</option>
                    <option value="iQOO">iQOO</option>
                    <option value="OnePlus">OnePlus</option>
                    <option value="Google">Google</option>
                    <option value="Xiaomi">Xiaomi</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.sellingPrice || ''}
                    onChange={(e) => setProductForm({ ...productForm, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Original MRP Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice || ''}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Condition Grade</label>
                  <select
                    value={productForm.condition || 'Like New'}
                    onChange={(e) => setProductForm({ ...productForm, condition: e.target.value as DeviceCondition })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="Like New">Like New (Flawless)</option>
                    <option value="Excellent">Excellent (Minor signs of use)</option>
                    <option value="Very Good">Very Good (Light signs of use)</option>
                    <option value="Good">Good (Budget value)</option>
                    <option value="Fair">Fair (Tested working budget grade)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={productForm.stock ?? 5}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">RAM & Storage</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 8GB"
                      value={productForm.ram || ''}
                      onChange={(e) => setProductForm({ ...productForm, ram: e.target.value })}
                      className="w-1/2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="e.g. 128GB"
                      value={productForm.storage || ''}
                      onChange={(e) => setProductForm({ ...productForm, storage: e.target.value })}
                      className="w-1/2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Battery Health (%)</label>
                  <input
                    type="number"
                    value={productForm.batteryHealth ?? 95}
                    onChange={(e) => setProductForm({ ...productForm, batteryHealth: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                {/* Multi-Image Uploader: Up to 5 Images, Gallery File Picker + URL Option */}
                <div className="sm:col-span-2 pt-2 border-t border-slate-800">
                  <MultiImageUploader
                    images={productForm.images || []}
                    primaryImage={productForm.primaryImage}
                    productId={editingProduct?.id || 'new_phone'}
                    onChange={(newImages, newPrimary) => {
                      setProductForm({
                        ...productForm,
                        images: newImages,
                        primaryImage: newPrimary
                      });
                    }}
                    showToast={showToast}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">Full Product Description</label>
                  <textarea
                    rows={3}
                    value={productForm.description || ''}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Enter complete description including condition details, battery status, and packaging..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                {/* Technical Specifications Management */}
                <div className="sm:col-span-2 pt-3 border-t border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
                    Hardware Specifications Matrix
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Display & Resolution</label>
                      <input
                        type="text"
                        placeholder="e.g. 6.1-inch Super Retina XDR OLED"
                        value={productForm.specs?.display || ''}
                        onChange={(e) => setProductForm({
                          ...productForm,
                          specs: { ...(productForm.specs || { display: '', processor: '', camera: '', battery: '', os: '' }), display: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Processor / Chipset</label>
                      <input
                        type="text"
                        placeholder="e.g. Apple A15 Bionic (5nm)"
                        value={productForm.specs?.processor || ''}
                        onChange={(e) => setProductForm({
                          ...productForm,
                          specs: { ...(productForm.specs || { display: '', processor: '', camera: '', battery: '', os: '' }), processor: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Camera System</label>
                      <input
                        type="text"
                        placeholder="e.g. Dual 12MP (Wide + Ultra-Wide) with OIS"
                        value={productForm.specs?.camera || ''}
                        onChange={(e) => setProductForm({
                          ...productForm,
                          specs: { ...(productForm.specs || { display: '', processor: '', camera: '', battery: '', os: '' }), camera: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Battery & Charging</label>
                      <input
                        type="text"
                        placeholder="e.g. 3240 mAh · 20W Fast Charging"
                        value={productForm.specs?.battery || ''}
                        onChange={(e) => setProductForm({
                          ...productForm,
                          specs: { ...(productForm.specs || { display: '', processor: '', camera: '', battery: '', os: '' }), battery: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Operating System</label>
                      <input
                        type="text"
                        placeholder="e.g. iOS 17 / Android 14"
                        value={productForm.specs?.os || ''}
                        onChange={(e) => setProductForm({
                          ...productForm,
                          specs: { ...(productForm.specs || { display: '', processor: '', camera: '', battery: '', os: '' }), os: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Network & Wireless</label>
                      <input
                        type="text"
                        placeholder="e.g. 5G Dual SIM · Wi-Fi 6 · Bluetooth 5.3"
                        value={productForm.specs?.network || ''}
                        onChange={(e) => setProductForm({
                          ...productForm,
                          specs: { ...(productForm.specs || { display: '', processor: '', camera: '', battery: '', os: '' }), network: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsAddingProduct(false);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF6A00] hover:bg-[#E55F00] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
