import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, ShoppingBag, Zap, Eye, BatteryCharging, Check, Scale } from 'lucide-react';
import { handleImageError, FALLBACK_PHONE_IMAGE } from '../utils/imageFallback';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    openProductPage,
    addToCart,
    setIsCheckoutOpen,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    isInCompare
  } = useStore();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const isFavorited = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, product.storage, product.color, {
      selectedRam: product.ram,
      selectedStorage: product.storage,
      selectedColor: product.color,
      variantSellingPrice: product.sellingPrice,
      variantOriginalPrice: product.originalPrice
    });
    setIsCheckoutOpen(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, product.storage, product.color, {
      selectedRam: product.ram,
      selectedStorage: product.storage,
      selectedColor: product.color,
      variantSellingPrice: product.sellingPrice,
      variantOriginalPrice: product.originalPrice
    });
  };

  const conditionBadgeStyles: Record<string, string> = {
    'Like New': 'bg-emerald-50 text-emerald-700 border-emerald-200/90',
    Excellent: 'bg-sky-50 text-sky-700 border-sky-200/90',
    'Very Good': 'bg-indigo-50 text-indigo-700 border-indigo-200/90',
    Good: 'bg-amber-50 text-amber-700 border-amber-200/90',
    Fair: 'bg-slate-100 text-slate-700 border-slate-200/90'
  };

  return (
    <div
      onClick={() => openProductPage(product)}
      className="group bg-white rounded-3xl border border-slate-200/90 hover:border-slate-400/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer transform hover:-translate-y-1"
    >
      <div>
        {/* Image Frame */}
        <div className="relative bg-gradient-to-b from-slate-50 via-slate-50/70 to-slate-100/60 aspect-4/3 sm:aspect-square overflow-hidden border-b border-slate-100 flex items-center justify-center p-5">
          {/* Top Left: Discount Percentage Badge */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
            <span className="bg-[#FF6A00] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm tracking-tight font-display">
              {product.discountPercentage}% OFF
            </span>
          </div>

          {/* Top Right: Wishlist & Compare Icons */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                isFavorited
                  ? 'bg-rose-50 text-rose-600 shadow-sm scale-110'
                  : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white shadow-xs'
              }`}
              title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCompare(product);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                inCompare
                  ? 'bg-[#FF6A00] text-white shadow-sm'
                  : 'bg-white/90 text-slate-400 hover:text-slate-900 hover:bg-white shadow-xs'
              }`}
              title={inCompare ? 'Remove from Compare' : 'Compare Smartphone'}
              aria-label="Compare"
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Smartphone Visual */}
          <div className="relative w-full h-full flex items-center justify-center p-2">
            <img
              src={
                (product.images && product.images[activeImageIndex]) ||
                product.primaryImage ||
                product.images?.[0] ||
                FALLBACK_PHONE_IMAGE
              }
              alt={product.name}
              referrerPolicy="no-referrer"
              onError={handleImageError}
              onMouseEnter={() => {
                if (product.images && product.images.length > 1) setActiveImageIndex(1);
              }}
              onMouseLeave={() => setActiveImageIndex(0)}
              className="max-h-full max-w-full object-contain aspect-square transform group-hover:scale-105 transition-transform duration-300 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
              loading="lazy"
            />
          </div>

          {/* Multiple Angle Image Dots */}
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-2.5 right-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
              {product.images.slice(0, 5).map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    activeImageIndex === i ? 'bg-[#FF6A00] w-2.5' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Stock Indicator */}
          <div className="absolute bottom-2.5 left-3 z-10">
            {product.stock <= 0 ? (
              <span className="text-[10px] font-bold text-rose-800 bg-rose-100/90 border border-rose-300 px-2 py-0.5 rounded-md shadow-2xs">
                Out of Stock
              </span>
            ) : product.stock <= 3 ? (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md shadow-2xs">
                ⚡ Only {product.stock} left
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-slate-600 bg-white/90 border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" /> In Stock
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 space-y-2.5">
          {/* Brand, Launch Year & Condition Badge */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] truncate">
                {product.brand}
              </span>
              {product.launchYear && (
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">
                  {product.launchYear}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                conditionBadgeStyles[product.condition] || conditionBadgeStyles.Excellent
              }`}
            >
              {product.condition}
            </span>
          </div>

          {/* Smartphone Name */}
          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#FF6A00] transition-colors line-clamp-1 font-display">
            {product.name}
          </h3>

          {/* RAM, Storage & Battery Health Summary */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span className="font-semibold text-slate-800">{product.ram} RAM</span>
            <span className="text-slate-300">·</span>
            <span className="font-bold text-slate-900">{product.storage}</span>
            {product.batteryHealth && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  <BatteryCharging className="w-3 h-3" />
                  {product.batteryHealth}%
                </span>
              </>
            )}
          </div>

          {/* Pricing */}
          <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-extrabold text-slate-950 font-display tabular-nums">
                  ₹{product.sellingPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                Save ₹{(product.originalPrice - product.sellingPrice).toLocaleString('en-IN')} · 7-Day Replacement
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 sm:p-5 pt-0 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openProductPage(product);
            }}
            className="w-full py-2 px-2 rounded-xl border border-slate-200 hover:border-slate-900 text-slate-700 hover:text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer bg-white"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>View Details</span>
          </button>

          <button
            onClick={handleAddToCart}
            className="w-full py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-slate-700" />
            <span>Add to Cart</span>
          </button>
        </div>

        <button
          onClick={handleBuyNow}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-[#FF6A00] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:shadow-md"
        >
          <Zap className="w-3.5 h-3.5 text-[#FF6A00] group-hover:text-white transition-colors" />
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
};
