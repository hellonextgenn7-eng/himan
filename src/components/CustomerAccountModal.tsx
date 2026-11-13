import React, { useState } from 'react';
import { useStore, AccountModalTab } from '../context/StoreContext';
import { FeedbackCategory, CustomerDetails } from '../types';
import {
  X,
  User,
  Package,
  Heart,
  MapPin,
  MessageSquare,
  LogOut,
  ShieldCheck,
  Trash2,
  Plus,
  ShoppingBag,
  CheckCircle2,
  Clock,
  AlertCircle,
  KeyRound,
  Mail,
  Send
} from 'lucide-react';
import { handleImageError } from '../utils/imageFallback';

export const CustomerAccountModal: React.FC = () => {
  const {
    isAccountModalOpen,
    setIsAccountModalOpen,
    accountModalTab,
    setAccountModalTab,
    customerAccount,
    registerCustomer,
    loginCustomerWithCredentials,
    loginCustomerWithGoogle,
    resetCustomerPassword,
    updateCustomerProfile,
    saveCustomerAddress,
    deleteCustomerAddress,
    logoutCustomer,
    orders,
    cancelOrder,
    requestOrderReturn,
    wishlist,
    toggleWishlist,
    products,
    openProductPage,
    addToCart,
    feedbacks,
    submitFeedback,
    settings,
    setIsOrderTrackingOpen
  } = useStore();

  // Auth mode when not logged in
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [authFullName, setAuthFullName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Profile Edit State
  const [profileName, setProfileName] = useState(customerAccount?.fullName || '');
  const [profileEmail, setProfileEmail] = useState(customerAccount?.email || '');
  const [profilePhone, setProfilePhone] = useState(customerAccount?.phone || '');

  // New Address State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<CustomerDetails>({
    fullName: customerAccount?.fullName || '',
    phone: customerAccount?.phone || '',
    email: customerAccount?.email || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  // Feedback & Support Form State
  const [fbCategory, setFbCategory] = useState<FeedbackCategory>('Submit Feedback');
  const [fbName, setFbName] = useState(customerAccount?.fullName || '');
  const [fbEmail, setFbEmail] = useState(customerAccount?.email || '');
  const [fbPhone, setFbPhone] = useState(customerAccount?.phone || '');
  const [fbOrderId, setFbOrderId] = useState('');
  const [fbProductName, setFbProductName] = useState('');
  const [fbRating, setFbRating] = useState(5);
  const [fbSubject, setFbSubject] = useState('');
  const [fbMessage, setFbMessage] = useState('');
  const [fbSubmittedTicketId, setFbSubmittedTicketId] = useState<string | null>(null);

  if (!isAccountModalOpen) return null;

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const customerOrders = customerAccount
    ? orders.filter(
        (o) =>
          o.customer.email.toLowerCase() === customerAccount.email.toLowerCase() ||
          (customerAccount.phone &&
            o.customer.phone.replace(/\s+/g, '').includes(customerAccount.phone.replace(/\s+/g, '')))
      )
    : orders;

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'register') {
      const ok = registerCustomer(authFullName, authEmail, authPhone, authPassword);
      if (ok) {
        setProfileName(authFullName);
        setProfileEmail(authEmail);
        setProfilePhone(authPhone);
        setFbName(authFullName);
        setFbEmail(authEmail);
        setFbPhone(authPhone);
      }
    } else if (authMode === 'login') {
      const ok = loginCustomerWithCredentials(authEmail, authPassword);
      if (ok) {
        setAuthPassword('');
      }
    } else if (authMode === 'forgot') {
      const ok = resetCustomerPassword(authEmail, authPassword);
      if (ok) {
        setAuthMode('login');
        setAuthPassword('');
      }
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile({
      fullName: profileName,
      email: profileEmail,
      phone: profilePhone
    });
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomerAddress(newAddress);
    setShowAddAddress(false);
    setNewAddress({
      fullName: customerAccount?.fullName || '',
      phone: customerAccount?.phone || '',
      email: customerAccount?.email || '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    });
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ticket = await submitFeedback({
      customerName: fbName || customerAccount?.fullName || 'Valued Customer',
      customerEmail: fbEmail || customerAccount?.email || '',
      customerPhone: fbPhone || customerAccount?.phone || '',
      category: fbCategory,
      orderId: fbOrderId,
      productName: fbProductName,
      rating: fbRating,
      subject: fbSubject || fbCategory,
      message: fbMessage
    });
    setFbSubmittedTicketId(ticket.id);
    setFbSubject('');
    setFbMessage('');
  };

  const tabs: { id: AccountModalTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'My Account', icon: User },
    { id: 'orders', label: 'Orders & Returns', icon: Package, badge: customerOrders.length },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlistedProducts.length },
    {
      id: 'addresses',
      label: 'Saved Addresses',
      icon: MapPin,
      badge: customerAccount?.savedAddresses?.length || 0
    },
    { id: 'feedback', label: 'Feedback & Support', icon: MessageSquare }
  ];

  const feedbackCategories: FeedbackCategory[] = [
    'Submit Feedback',
    'Report an Issue',
    'Product-related complaint',
    'Order-related complaint',
    'Delivery-related complaint',
    'General enquiry'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-950 text-white px-5 py-4 sm:px-7 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6A00] flex items-center justify-center font-black text-white">
              PB
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold font-display">
                {customerAccount ? `Hello, ${customerAccount.fullName}` : 'Phone Bazar Customer Hub'}
              </h2>
              <p className="text-xs text-slate-400">
                {customerAccount
                  ? customerAccount.email
                  : 'Manage orders, wishlist, addresses & 24/7 customer support'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {customerAccount && (
              <button
                type="button"
                onClick={logoutCustomer}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsAccountModalOpen(false)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-7 flex items-center gap-1.5 overflow-x-auto py-2.5 shrink-0 scrollbar-none">
          {tabs.map((tab) => {
            const IconComp = tab.icon;
            const active = accountModalTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAccountModalTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                }`}
              >
                <IconComp className={`w-4 h-4 ${active ? 'text-[#FF6A00]' : ''}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      active ? 'bg-[#FF6A00] text-white' : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {/* ===============================================================
              TAB 1: OVERVIEW / AUTH / PROFILE
              =============================================================== */}
          {accountModalTab === 'overview' && (
            <>
              {!customerAccount ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Auth Form */}
                  <div className="lg:col-span-7 bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-5">
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                      <button
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                          authMode === 'login'
                            ? 'bg-slate-950 text-white'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Login
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMode('register')}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                          authMode === 'register'
                            ? 'bg-slate-950 text-white'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Create Account
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMode('forgot')}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                          authMode === 'forgot'
                            ? 'bg-slate-950 text-white'
                            : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Forgot Password
                      </button>
                    </div>

                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                      {authMode === 'register' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={authFullName}
                            onChange={(e) => setAuthFullName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full p-3 rounded-xl bg-white border border-slate-300 text-sm font-medium focus:border-[#FF6A00] focus:outline-none"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {authMode === 'login' ? 'Email Address or Mobile Number *' : 'Email Address *'}
                        </label>
                        <input
                          type={authMode === 'login' ? 'text' : 'email'}
                          required
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full p-3 rounded-xl bg-white border border-slate-300 text-sm font-medium focus:border-[#FF6A00] focus:outline-none"
                        />
                      </div>

                      {authMode === 'register' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            10-Digit Mobile Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={authPhone}
                            onChange={(e) => setAuthPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full p-3 rounded-xl bg-white border border-slate-300 text-sm font-medium focus:border-[#FF6A00] focus:outline-none"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {authMode === 'forgot' ? 'Enter New Password *' : 'Password *'}
                        </label>
                        <input
                          type="password"
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full p-3 rounded-xl bg-white border border-slate-300 text-sm font-medium focus:border-[#FF6A00] focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-[#FF6A00] hover:bg-orange-600 text-white font-extrabold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
                      >
                        {authMode === 'login'
                          ? 'Sign In to Phone Bazar'
                          : authMode === 'register'
                          ? 'Create My Account'
                          : 'Reset My Password'}
                      </button>
                    </form>

                    <div className="relative flex py-1 items-center">
                      <div className="grow border-t border-slate-200"></div>
                      <span className="shrink mx-3 text-xs text-slate-400 font-semibold">OR</span>
                      <div className="grow border-t border-slate-200"></div>
                    </div>

                    <button
                      type="button"
                      onClick={() => loginCustomerWithGoogle()}
                      className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Continue with Verified Google Account</span>
                    </button>
                  </div>

                  {/* Account Benefits */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="p-5 rounded-2xl bg-slate-950 text-white space-y-3">
                      <h3 className="text-base font-extrabold font-display text-[#FF6A00]">
                        Phone Bazar Member Benefits
                      </h3>
                      <ul className="space-y-2.5 text-xs text-slate-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Track real-time shipment status & download official GST warranty invoices.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Save multiple delivery addresses for 1-click express checkout.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>Initiate 7-Day Replacement Guarantee or submit direct support tickets.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                      <p className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-[#FF6A00]" /> Official Customer Care Email
                      </p>
                      <p className="text-xs font-bold text-[#FF6A00]">{settings.officialEmail}</p>
                      <p className="text-[11px] text-slate-500">
                        Need help without signing in? Switch to the <strong>Feedback & Support</strong> tab above at any time.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Profile Details Editor */}
                  <form
                    onSubmit={handleSaveProfile}
                    className="md:col-span-7 p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-4"
                  >
                    <h3 className="text-base font-extrabold text-slate-950 font-display">
                      Profile Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={profileName || customerAccount.fullName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
                        <input
                          type="email"
                          value={profileEmail || customerAccount.email}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Mobile Number</label>
                        <input
                          type="tel"
                          value={profilePhone || customerAccount.phone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-slate-950 hover:bg-[#FF6A00] text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
                    >
                      Save Profile Changes
                    </button>
                  </form>

                  {/* Quick Account Summary */}
                  <div className="md:col-span-5 space-y-3">
                    <div
                      onClick={() => setAccountModalTab('orders')}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-[#FF6A00] bg-white flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500">Total Orders</p>
                          <p className="text-lg font-black text-slate-950">{customerOrders.length}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#FF6A00]">View →</span>
                    </div>

                    <div
                      onClick={() => setAccountModalTab('wishlist')}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-[#FF6A00] bg-white flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                          <Heart className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500">Saved in Wishlist</p>
                          <p className="text-lg font-black text-slate-950">{wishlistedProducts.length} Phones</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#FF6A00]">View →</span>
                    </div>

                    <div
                      onClick={() => setAccountModalTab('feedback')}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-[#FF6A00] bg-white flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500">Support & Feedback</p>
                          <p className="text-sm font-black text-slate-950">Report Issue / Feedback</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#FF6A00]">Open →</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===============================================================
              TAB 2: ORDER HISTORY & ORDER DETAILS
              =============================================================== */}
          {accountModalTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-950 font-display">
                    Your Orders & Shipments
                  </h3>
                  <p className="text-xs text-slate-500">
                    View live order progress, cancel before dispatch, or request a 7-day replacement
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountModalOpen(false);
                    setIsOrderTrackingOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-[#FF6A00] text-white text-xs font-extrabold cursor-pointer"
                >
                  Track by Order ID / AWB
                </button>
              </div>

              {customerOrders.length === 0 ? (
                <div className="p-10 text-center rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <Package className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-extrabold text-slate-900">No orders found yet</p>
                  <p className="text-xs text-slate-500">
                    Explore our 32-point certified smartphones to place your first order.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-lg bg-slate-950 text-white text-xs font-black">
                            #{order.id}
                          </span>
                          <span className="text-xs text-slate-500">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold">
                            Status: {order.orderStatus}
                          </span>
                          <span className="text-sm font-black text-slate-950">
                            ₹{order.totalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.product.images?.[0]}
                                alt={item.product.name}
                                referrerPolicy="no-referrer"
                                onError={handleImageError}
                                className="w-12 h-12 rounded-lg object-contain bg-slate-50 border border-slate-200 p-1"
                              />
                              <div>
                                <p className="font-extrabold text-slate-950">{item.product.name}</p>
                                <p className="text-slate-500">
                                  {item.selectedRam || item.product.ram} RAM · {item.selectedStorage} ·{' '}
                                  {item.selectedColor} · Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-slate-900">
                              ₹{((item.variantSellingPrice ?? item.product.sellingPrice) * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="text-slate-600">
                          <span className="font-bold">Ship To:</span> {order.customer.fullName},{' '}
                          {order.customer.city} ({order.customer.pincode}) ·{' '}
                          <span className="text-emerald-700 font-semibold">
                            {order.estimatedDeliveryDate || 'Express Dispatch'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {order.orderStatus !== 'Cancelled' &&
                            order.orderStatus !== 'Delivered' &&
                            order.orderStatus !== 'Return Requested' && (
                              <button
                                type="button"
                                onClick={() => cancelOrder(order.id)}
                                className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold cursor-pointer"
                              >
                                Cancel Order
                              </button>
                            )}
                          {order.orderStatus === 'Delivered' && (
                            <button
                              type="button"
                              onClick={() => requestOrderReturn(order.id)}
                              className="px-3 py-1.5 rounded-lg border border-orange-200 text-[#FF6A00] hover:bg-orange-50 font-bold cursor-pointer"
                            >
                              Request 7-Day Replacement
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===============================================================
              TAB 3: WISHLIST
              =============================================================== */}
          {accountModalTab === 'wishlist' && (
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-950 font-display">
                Saved Smartphones in Wishlist ({wishlistedProducts.length})
              </h3>

              {wishlistedProducts.length === 0 ? (
                <div className="p-10 text-center rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <Heart className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-extrabold text-slate-900">Your Wishlist is Empty</p>
                  <p className="text-xs text-slate-500">
                    Tap the heart icon on any smartphone to save it here for quick comparison.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlistedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={p.images?.[0]}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          onError={handleImageError}
                          className="w-20 h-20 object-contain bg-slate-50 rounded-xl p-2 border border-slate-100 shrink-0"
                        />
                        <div className="space-y-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase text-[#FF6A00]">{p.brand}</span>
                          <h4 className="text-sm font-extrabold text-slate-950 truncate">{p.name}</h4>
                          <p className="text-xs text-slate-500">
                            {p.ram} / {p.storage} · {p.condition}
                          </p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-black text-slate-950">
                              ₹{p.sellingPrice.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs text-slate-400 line-through">
                              ₹{p.originalPrice.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAccountModalOpen(false);
                            openProductPage(p);
                          }}
                          className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-extrabold cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          onClick={() => addToCart(p, 1, p.storage, p.color)}
                          className="flex-1 py-2 rounded-xl bg-[#FF6A00] hover:bg-orange-600 text-white text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Add
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(p.id)}
                          className="p-2 rounded-xl border border-slate-200 text-rose-500 hover:bg-rose-50 cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===============================================================
              TAB 4: SAVED ADDRESSES
              =============================================================== */}
          {accountModalTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-950 font-display">
                    Saved Delivery Addresses
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage your doorstep delivery addresses across India
                  </p>
                </div>
                {customerAccount && (
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    className="px-4 py-2 rounded-xl bg-[#FF6A00] hover:bg-orange-600 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {!customerAccount ? (
                <div className="p-8 text-center rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                  <p className="text-sm font-bold text-slate-800">
                    Please sign in to save and manage multiple delivery addresses.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAccountModalTab('overview')}
                    className="px-5 py-2.5 bg-slate-950 text-white text-xs font-extrabold rounded-xl cursor-pointer"
                  >
                    Go to Login / Register
                  </button>
                </div>
              ) : (
                <>
                  {showAddAddress && (
                    <form
                      onSubmit={handleAddAddressSubmit}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
                    >
                      <h4 className="text-xs font-extrabold uppercase text-slate-700">New Delivery Address</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="Full Name *"
                          value={newAddress.fullName}
                          onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                          className="p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                        />
                        <input
                          type="tel"
                          required
                          placeholder="Mobile Number *"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          className="p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                        />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="6-Digit PIN Code *"
                          value={newAddress.pincode}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, '') })
                          }
                          className="p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                        />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="House / Flat No., Building, Street, Area *"
                        value={newAddress.address}
                        onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="City / District *"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                        />
                        <input
                          type="text"
                          required
                          placeholder="State *"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                        />
                        <input
                          type="text"
                          placeholder="Landmark (Optional)"
                          value={newAddress.landmark || ''}
                          onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                          className="p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddAddress(false)}
                          className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-slate-950 text-white text-xs font-extrabold cursor-pointer"
                        >
                          Save Address
                        </button>
                      </div>
                    </form>
                  )}

                  {(!customerAccount.savedAddresses || customerAccount.savedAddresses.length === 0) ? (
                    <div className="p-8 text-center rounded-2xl border border-slate-200 bg-slate-50">
                      <p className="text-xs font-bold text-slate-600">
                        No saved addresses yet. Click "Add New Address" above to save your delivery location.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {customerAccount.savedAddresses.map((addr, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start justify-between gap-3"
                        >
                          <div className="space-y-1 text-xs">
                            <p className="font-extrabold text-slate-950">{addr.fullName}</p>
                            <p className="text-slate-600">{addr.address}</p>
                            <p className="text-slate-600">
                              {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                            </p>
                            <p className="text-slate-500">Phone: {addr.phone}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteCustomerAddress(idx)}
                            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ===============================================================
              TAB 5: DEDICATED CUSTOMER FEEDBACK & SUPPORT SECTION
              =============================================================== */}
          {accountModalTab === 'feedback' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Submit Feedback / Complaint Form */}
              <form
                onSubmit={handleFeedbackSubmit}
                className="lg:col-span-7 p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-950 font-display">
                    Feedback & Support Desk
                  </h3>
                  <p className="text-xs text-slate-600">
                    Share your shopping feedback, report an issue, or raise a complaint directly with our verification team.
                  </p>
                </div>

                {fbSubmittedTicketId && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs space-y-1">
                    <p className="font-extrabold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ticket #{fbSubmittedTicketId} Received!
                    </p>
                    <p>
                      Thank you! Your request has been logged and routed to our support team ({settings.officialEmail}).
                    </p>
                  </div>
                )}

                {/* Category Selector Pills */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-700 uppercase">
                    Select Support Category *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {feedbackCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFbCategory(cat)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                          fbCategory === cat
                            ? 'bg-slate-950 text-white border-slate-950 ring-2 ring-[#FF6A00]'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={fbName}
                      onChange={(e) => setFbName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={fbEmail}
                      onChange={(e) => setFbEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Order ID (If applicable)
                    </label>
                    <input
                      type="text"
                      value={fbOrderId}
                      onChange={(e) => setFbOrderId(e.target.value)}
                      placeholder="e.g. PB-729401"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Smartphone Model (Optional)
                    </label>
                    <input
                      type="text"
                      value={fbProductName}
                      onChange={(e) => setFbProductName(e.target.value)}
                      placeholder="e.g. Samsung Galaxy S20+"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Headline *</label>
                  <input
                    type="text"
                    required
                    value={fbSubject}
                    onChange={(e) => setFbSubject(e.target.value)}
                    placeholder={`Brief summary of your ${fbCategory.toLowerCase()}`}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Detailed Message / Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={fbMessage}
                    onChange={(e) => setFbMessage(e.target.value)}
                    placeholder="Please describe your feedback, issue, or enquiry in detail so our team can assist you promptly..."
                    className="w-full p-3 rounded-xl bg-white border border-slate-300 text-xs font-semibold focus:border-[#FF6A00] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#FF6A00] hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit {fbCategory}</span>
                </button>
              </form>

              {/* Submitted Support Tickets & Official Contact Info */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950 text-white space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6A00]">
                    Official Escalation & Care
                  </span>
                  <h4 className="text-sm font-extrabold">Phone Bazar Customer Resolution Desk</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Every support ticket is tracked with a unique reference ID. You can also write directly to our official support email:
                  </p>
                  <a
                    href={`mailto:${settings.officialEmail}`}
                    className="inline-flex items-center gap-2 text-xs font-extrabold text-[#FF6A00] hover:underline pt-1"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{settings.officialEmail}</span>
                  </a>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    Recent Feedback & Support Tickets ({feedbacks.length})
                  </h4>
                  <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                    {feedbacks.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-slate-900">
                            #{item.id} · {item.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              item.status === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.status === 'In Review'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="font-bold text-slate-800">{item.subject}</p>
                        <p className="text-slate-600 line-clamp-2">{item.message}</p>
                        {item.adminReply && (
                          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-900 text-[11px]">
                            <strong>Phone Bazar Support Reply:</strong> {item.adminReply}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
