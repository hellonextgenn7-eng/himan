import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Search, ShieldCheck, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Order, OrderStatus, CartItem } from '../types';
import { handleImageError } from '../utils/imageFallback';

export const OrderTrackingModal: React.FC = () => {
  const {
    isOrderTrackingOpen,
    setIsOrderTrackingOpen,
    getOrderById,
    orders,
    cancelOrder,
    requestOrderReturn
  } = useStore();
  const [searchInput, setSearchInput] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(() => orders[0] || null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOrderTrackingOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const found = getOrderById(searchInput);
    setSearchedOrder(found || null);
    setHasSearched(true);
  };

  // All 7 requested progression steps
  const statusSteps: { label: OrderStatus; desc: string }[] = [
    { label: 'Order Placed', desc: 'Order received and registered in Phone Bazar fulfillment system.' },
    { label: 'Payment Confirmed', desc: 'Payment / COD verification completed and stock reserved.' },
    { label: 'Processing', desc: 'Device pulled from climate-controlled inventory for final prep.' },
    {
      label: 'Quality Check',
      desc: '32-Point hardware, battery health, and IMEI certification signed off.'
    },
    {
      label: 'Dispatched',
      desc: 'Handed over in tamper-proof box to insured express courier partner.'
    },
    {
      label: 'Out for Delivery',
      desc: 'Arrived at your local postal hub and out with delivery executive.'
    },
    {
      label: 'Delivered',
      desc: 'Delivered to customer. 7-Day Replacement Guarantee & 6M Warranty active.'
    }
  ];

  const resolveStepIndex = (status: OrderStatus): number => {
    const map: Record<string, number> = {
      'Order Placed': 0,
      Confirmed: 1,
      'Payment Confirmed': 1,
      Processing: 2,
      Packed: 3,
      'Quality Check': 3,
      Shipped: 4,
      Dispatched: 4,
      'Out for Delivery': 5,
      Delivered: 6
    };
    return map[status] ?? 1;
  };

  // Keep searchedOrder synced with live order status updates
  const liveOrder = searchedOrder ? orders.find((o) => o.id === searchedOrder.id) || searchedOrder : null;
  const currentStepIdx = liveOrder ? resolveStepIndex(liveOrder.orderStatus) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-950 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF6A00] flex items-center justify-center text-white">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold font-display">Track Your Smartphone Order</h2>
              <p className="text-xs text-slate-400">
                7-Stage Live Courier & 32-Point Quality Inspection Tracker
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOrderTrackingOpen(false)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close tracking"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Order ID (e.g. PB-729401), Tracking AWB, or Phone Number"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-950 hover:bg-[#FF6A00] text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
            >
              Track Order
            </button>
          </form>
          <p className="text-[11px] text-slate-500 mt-2">
            Sample Order ID: <span className="font-mono font-bold text-slate-800">PB-729401</span>
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {liveOrder ? (
            <div className="space-y-6">
              {/* Order Meta Header */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Order Reference</span>
                  <p className="text-lg font-extrabold text-slate-950 font-display">{liveOrder.id}</p>
                  <p className="text-xs text-slate-500">
                    Placed on {new Date(liveOrder.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Courier AWB</span>
                  <p className="text-sm font-extrabold text-slate-900 font-mono">
                    {liveOrder.trackingId || 'IN-EXP-847291'}
                  </p>
                  <p className="text-xs text-emerald-700 font-bold">
                    {liveOrder.courierPartner || 'BlueDart Express'}
                  </p>
                </div>
              </div>

              {liveOrder.orderStatus === 'Cancelled' || liveOrder.orderStatus === 'Return Requested' ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                  <p className="font-extrabold text-sm">Order Status: {liveOrder.orderStatus}</p>
                  <p>{liveOrder.cancellationReason || 'Updated per customer request.'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 font-display">
                    Live 7-Stage Shipment Progress
                  </h4>

                  <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-5">
                    {statusSteps.map((stepObj, index) => {
                      const isDone = currentStepIdx >= index;
                      const isCurrent = currentStepIdx === index;

                      return (
                        <div key={stepObj.label} className="relative">
                          <div
                            className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                              isDone
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'bg-white border-slate-300 text-slate-400'
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-extrabold ${
                                  isCurrent
                                    ? 'text-[#FF6A00]'
                                    : isDone
                                    ? 'text-slate-900'
                                    : 'text-slate-400'
                                }`}
                              >
                                {stepObj.label}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold text-[#FF6A00] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                                  Active Stage
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{stepObj.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items in Order */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 font-display">
                  Ordered Smartphones
                </h4>

                <div className="space-y-2">
                  {liveOrder.items.map((item: CartItem, idx: number) => {
                    const price = item.variantSellingPrice ?? item.product.sellingPrice;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            referrerPolicy="no-referrer"
                            onError={handleImageError}
                            className="w-12 h-12 object-contain"
                          />
                          <div>
                            <p className="text-xs font-extrabold text-slate-900">{item.product.name}</p>
                            <p className="text-[11px] text-slate-500">
                              {item.selectedRam || item.product.ram} / {item.selectedStorage} ·{' '}
                              {item.product.condition} · Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-950 tabular-nums">
                          ₹{(price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Actions (Cancel / Return) */}
              <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#FF6A00] shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700">
                    <span className="font-extrabold text-slate-900 block">
                      Delivering to {liveOrder.customer.fullName} ({liveOrder.customer.city} -{' '}
                      {liveOrder.customer.pincode})
                    </span>
                    <span>Protected by 7-Day Replacement Guarantee</span>
                  </div>
                </div>

                {liveOrder.orderStatus !== 'Cancelled' &&
                  liveOrder.orderStatus !== 'Delivered' &&
                  liveOrder.orderStatus !== 'Return Requested' && (
                    <button
                      type="button"
                      onClick={() => cancelOrder(liveOrder.id)}
                      className="px-3.5 py-2 rounded-xl border border-rose-300 bg-white text-rose-600 hover:bg-rose-50 text-xs font-extrabold cursor-pointer shrink-0"
                    >
                      Cancel Order
                    </button>
                  )}

                {liveOrder.orderStatus === 'Delivered' && (
                  <button
                    type="button"
                    onClick={() => requestOrderReturn(liveOrder.id)}
                    className="px-3.5 py-2 rounded-xl bg-slate-950 text-white text-xs font-extrabold cursor-pointer shrink-0"
                  >
                    Claim 7-Day Replacement
                  </button>
                )}
              </div>
            </div>
          ) : (
            hasSearched && (
              <div className="text-center py-12 space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h4 className="text-base font-extrabold text-slate-900">No Matching Order Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We could not find an order matching "{searchInput}". Please check your Order ID (e.g. PB-729401) or registered phone number.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
