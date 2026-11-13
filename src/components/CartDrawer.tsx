import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  ArrowRightLeft,
  Sparkles
} from 'lucide-react';
import { handleImageError } from '../utils/imageFallback';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartSubtotal,
    cartOriginalTotal,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    activeExchange,
    setActiveExchange,
    setIsExchangeModalOpen,
    settings
  } = useStore();

  if (!isCartOpen) return null;

  const deliveryCharge =
    cartSubtotal >= settings.freeShippingAbove || cart.length === 0 ? 0 : settings.defaultDeliveryCharge;
  const exchangeDiscount = activeExchange ? Math.min(activeExchange.estimatedValue, Math.round(cartSubtotal * 0.75)) : 0;
  const finalTotal = Math.max(0, cartSubtotal - exchangeDiscount + deliveryCharge);
  const totalSaved = Math.max(0, cartOriginalTotal - cartSubtotal) + exchangeDiscount;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF6A00] flex items-center justify-center text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold font-display">Your Shopping Cart</h2>
              <p className="text-xs text-slate-400">
                {cart.reduce((s, i) => s + i.quantity, 0)} smartphone{cart.length === 1 ? '' : 's'} selected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1 rounded-lg bg-slate-900 cursor-pointer"
                title="Empty shopping cart"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Shipping Banner */}
        <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-950 font-semibold">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Free Insured Express Delivery Across India</span>
          </div>
          <span className="font-extrabold text-emerald-700">₹0 Shipping</span>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length > 0 ? (
            <>
              {cart.map((item) => {
                const unitPrice = item.variantSellingPrice ?? item.product.sellingPrice;
                const unitOrig = item.variantOriginalPrice ?? item.product.originalPrice;
                const ramLabel = item.selectedRam || item.product.ram;
                return (
                  <div
                    key={`${item.product.id}-${ramLabel}-${item.selectedStorage}-${item.selectedColor}`}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex gap-3.5 items-center justify-between"
                  >
                    {/* Product Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1.5 shrink-0 overflow-hidden flex items-center justify-center">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        onError={handleImageError}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <h4 className="text-sm font-extrabold text-slate-950 truncate">{item.product.name}</h4>
                      <div className="text-[11px] font-semibold text-slate-600 flex flex-wrap items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-bold">
                          {ramLabel} / {item.selectedStorage}
                        </span>
                        <span>·</span>
                        <span>{item.selectedColor}</span>
                        <span>·</span>
                        <span className="text-emerald-700 font-bold">{item.product.condition}</span>
                      </div>
                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="text-sm font-black text-slate-950 tabular-nums">
                          ₹{(unitPrice * item.quantity).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-slate-400 line-through tabular-nums">
                          ₹{(unitOrig * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Stepper & Remove */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button
                        onClick={() =>
                          removeFromCart(item.product.id, item.selectedStorage, item.selectedColor, ramLabel)
                        }
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center border border-slate-200 bg-white rounded-lg overflow-hidden">
                        <button
                          onClick={() =>
                            updateCartQuantity(
                              item.product.id,
                              item.selectedStorage,
                              item.selectedColor,
                              item.quantity - 1,
                              ramLabel
                            )
                          }
                          className="p-1.5 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-extrabold text-slate-900 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQuantity(
                              item.product.id,
                              item.selectedStorage,
                              item.selectedColor,
                              item.quantity + 1,
                              ramLabel
                            )
                          }
                          className="p-1.5 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Your Cart is Empty</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Browse our certified pre-owned smartphones and select your preferred RAM & storage variant.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-3 px-5 py-2.5 bg-slate-950 hover:bg-[#FF6A00] text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
              >
                Explore Smartphones
              </button>
            </div>
          )}
        </div>

        {/* Bottom Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  ₹{cartSubtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {exchangeDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-bold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Exchange Trade-In Discount
                  </span>
                  <span>-₹{exchangeDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span>Insured Express Delivery</span>
                <span className="font-extrabold text-emerald-700">FREE</span>
              </div>

              <div className="flex items-center justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-200">
                <span>Final Payable Amount</span>
                <span className="text-lg text-slate-950 font-display tabular-nums">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {totalSaved > 0 && (
                <p className="text-[11px] font-bold text-emerald-700 text-right">
                  Total Savings on this Order: ₹{totalSaved.toLocaleString('en-IN')}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>7-Day Replacement Guarantee & 6 Months Warranty Included</span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 px-4 bg-[#FF6A00] hover:bg-orange-600 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
