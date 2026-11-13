export type DeviceCondition = 'Like New' | 'Excellent' | 'Very Good' | 'Good' | 'Fair';

export interface ProductVariant {
  id: string;
  ram: string;
  storage: string;
  sellingPrice: number;
  originalPrice: number;
  discountPercentage: number;
  stock: number;
  processor?: string;
  condition?: DeviceCondition;
  batteryHealth?: number;
}

export interface ProductSpecs {
  display: string;
  screenSize?: string;
  displayType?: string;
  processor: string;
  camera: string;
  battery: string;
  batteryCapacity?: string;
  os: string;
  network?: string;
  charging?: string;
}

export interface Product {
  id: string;
  name: string;
  brand:
    | 'Apple'
    | 'Apple iPhone'
    | 'Samsung'
    | 'OnePlus'
    | 'Google'
    | 'Google Pixel'
    | 'Xiaomi'
    | 'Redmi'
    | 'Realme'
    | 'Vivo'
    | 'Oppo'
    | 'OPPO'
    | 'Motorola'
    | 'POCO'
    | 'iQOO'
    | string;
  model: string;
  originalPrice: number;
  sellingPrice: number;
  discountPercentage: number;
  ram: string;
  storage: string;
  color: string;
  availableColors?: string[];
  condition: DeviceCondition;
  batteryHealth?: number;
  stock: number;
  images: string[];
  primaryImage?: string;
  description: string;
  specs: ProductSpecs;
  variants?: ProductVariant[];
  accessories: string[];
  warrantyInfo: string;
  launchYear?: number | string;
  isFeatured?: boolean;
  isBestDeal?: boolean;
  isLatestArrival?: boolean;
  rating: number;
  reviewCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedRam?: string;
  selectedStorage: string;
  selectedColor: string;
  selectedVariantId?: string;
  variantSellingPrice?: number;
  variantOriginalPrice?: number;
}

export type PaymentMethod = 'Razorpay' | 'Cashify' | 'UPI' | 'Card' | 'COD';
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed';
export type OrderStatus =
  | 'Order Placed'
  | 'Payment Confirmed'
  | 'Processing'
  | 'Quality Check'
  | 'Dispatched'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Cancelled'
  | 'Return Requested';

export interface CustomerDetails {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface ExchangeTradeIn {
  brand: string;
  model: string;
  storage: string;
  condition: string;
  screenCondition?: string;
  batteryStatus?: string;
  functionalStatus?: string;
  estimatedValue: number;
  provider?: string;
}

export interface Order {
  id: string;
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  discountAmount: number;
  exchangeDiscount?: number;
  exchangeDetails?: ExchangeTradeIn;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentTransactionId?: string;
  trackingId?: string;
  courierPartner?: string;
  createdAt: string;
  estimatedDeliveryDate?: string;
  cancellationReason?: string;
}

export type FeedbackCategory =
  | 'Submit Feedback'
  | 'Report an Issue'
  | 'Product-related complaint'
  | 'Order-related complaint'
  | 'Delivery-related complaint'
  | 'General enquiry';

export interface CustomerFeedback {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  category: FeedbackCategory;
  orderId?: string;
  productName?: string;
  rating?: number;
  subject: string;
  message: string;
  status: 'Submitted' | 'In Review' | 'Resolved';
  adminReply?: string;
  createdAt: string;
}

export interface CustomerAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash?: string;
  savedAddresses: CustomerDetails[];
  createdAt: string;
}

export interface StoreSettings {
  brandName: string;
  tagline: string;
  officialEmail: string;
  contactNumber: string;
  whatsappNumber: string;
  heroHeading: string;
  heroSubtitle: string;
  codEnabled: boolean;
  freeShippingAbove: number;
  defaultDeliveryCharge: number;
  razorpayKeyId: string;
  razorpayMode: 'sandbox' | 'live';
  cashifyGatewayEnabled?: boolean;
  cashifyKeyId?: string;
  cashifyMode?: 'sandbox' | 'live';
  managerPin: string;
  announcementText: string;
  announcementActive: boolean;
  storeAddress: string;
}

export interface Review {
  id: string;
  customerName: string;
  location: string;
  rating: number;
  date: string;
  verifiedBuyer: boolean;
  phoneModel: string;
  headline: string;
  comment: string;
}
