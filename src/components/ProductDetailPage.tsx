import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductVariant, DeviceCondition } from '../types';
import {
  ArrowLeft,
  Share2,
  Heart,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Truck,
  BatteryCharging,
  Zap,
  ShoppingBag,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  ZoomIn,
  ZoomOut,
  X,
  Package,
  Cpu,
  Star,
  Layers,
  ArrowRightLeft,
  Scale,
  Mail,
  Check,
  Sparkles,
  Wifi,
  Camera,
  Smartphone
} from 'lucide-react';
import { handleImageError } from '../utils/imageFallback';

// Helper to map Indian 6-digit PIN code prefix to Postal Circle & Delivery Timeline
function evaluateIndianPinCode(pin: string): {
  valid: boolean;
  region?: string;
  timeline?: string;
  message: string;
} {
  const clean = pin.trim();
  if (!/^[1-8]\d{5}$/.test(clean)) {
    return {
      valid: false,
      message: 'Please enter a valid 6-digit Indian Postal PIN code (starting with 1 to 8).'
    };
  }
  const prefix2 = parseInt(clean.slice(0, 2), 10);
  let region = 'India Express Zone';
  let days = '2–4 Business Days';

  if (prefix2 === 11) {
    region = 'Delhi NCR Metro Circle';
    days = '24 Hours (Next-Day Express Delivery)';
  } else if (prefix2 >= 12 && prefix2 <= 13) {
    region = 'Haryana Postal Circle';
    days = '1–2 Business Days';
  } else if (prefix2 >= 14 && prefix2 <= 16) {
    region = 'Punjab & Chandigarh Circle';
    days = '2–3 Business Days';
  } else if (prefix2 >= 20 && prefix2 <= 28) {
    region = 'Uttar Pradesh & Uttarakhand Circle';
    days = '2–3 Business Days';
  } else if (prefix2 >= 30 && prefix2 <= 34) {
    region = 'Rajasthan Postal Circle';
    days = '2–3 Business Days';
  } else if (prefix2 >= 36 && prefix2 <= 39) {
    region = 'Gujarat Postal Circle';
    days = '2–3 Business Days';
  } else if (prefix2 >= 40 && prefix2 <= 44) {
    region = 'Maharashtra & Mumbai Metro Circle';
    days = '1–3 Business Days';
  } else if (prefix2 >= 45 && prefix2 <= 49) {
    region = 'Madhya Pradesh & Chhattisgarh Circle';
    days = '3–4 Business Days';
  } else if (prefix2 >= 50 && prefix2 <= 53) {
    region = 'Telangana & Andhra Pradesh Circle';
    days = '2–3 Business Days';
  } else if (prefix2 >= 56 && prefix2 <= 59) {
    region = 'Karnataka & Bengaluru Metro Circle';
    days = '1–3 Business Days';
  } else if (prefix2 >= 60 && prefix2 <= 64) {
    region = 'Tamil Nadu & Chennai Metro Circle';
    days = '2–3 Business Days';
  } else if (prefix2 >= 67 && prefix2 <= 69) {
    region = 'Kerala Postal Circle';
    days = '3–4 Business Days';
  } else if (prefix2 >= 70 && prefix2 <= 74) {
    region = 'West Bengal & Kolkata Metro Circle';
    days = '2–3 Business Days';
  } else if (prefix2 >= 75 && prefix2 <= 77) {
    region = 'Odisha Postal Circle';
    days = '3–4 Business Days';
  } else if (prefix2 >= 78 && prefix2 <= 79) {
    region = 'North East & Assam Circle';
    days = '4–5 Business Days';
  } else if (prefix2 >= 80 && prefix2 <= 85) {
    region = 'Bihar & Jharkhand Postal Circle';
    days = '2–4 Business Days';
  }

  return {
    valid: true,
    region,
    timeline: days,
    message: `✓ Express Delivery Available to ${clean} (${region})! Estimated arrival in ${days} with Free Insured Shipping & Instant UPI / NetBanking / Card Checkout.`
  };
}

export const ProductDetailPage: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    setIsCheckoutOpen,
    setIsCartOpen,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    isInCompare,
    setIsCompareModalOpen,
    compareList,
    activeExchange,
    setActiveExchange,
    settings,
    products,
    showToast,
    closeProductPage,
    openAccountModal
  } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<ReturnType<typeof evaluateIndianPinCode> | null>(null);

  // Full-Screen Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);

  // Similar smartphones filter tab
  const [similarTab, setSimilarTab] = useState<'brand' | 'price'>('brand');

  // Touch swipe support for mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Initialize variant & color when product changes
  useEffect(() => {
    if (selectedProduct) {
      setActiveImageIndex(0);
      const variants = selectedProduct.variants && selectedProduct.variants.length > 0
        ? selectedProduct.variants
        : [
            {
              id: `${selectedProduct.id}_default`,
              ram: selectedProduct.ram || '8GB',
              storage: selectedProduct.storage || '128GB',
              sellingPrice: selectedProduct.sellingPrice,
              originalPrice: selectedProduct.originalPrice,
              discountPercentage: selectedProduct.discountPercentage,
              stock: selectedProduct.stock,
              processor: selectedProduct.specs?.processor,
              condition: selectedProduct.condition,
              batteryHealth: selectedProduct.batteryHealth
            }
          ];
      setSelectedVariant(variants[0]);
      setSelectedColor(selectedProduct.color || selectedProduct.availableColors?.[0] || 'Midnight Black');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedProduct?.id]);

  // Dynamic SEO Title, Meta Description & Product JSON-LD Structured Data
  useEffect(() => {
    if (!selectedProduct || !selectedVariant) return;

    const prevTitle = document.title;
    const titleText = `Buy ${selectedProduct.name} (${selectedVariant.ram} / ${selectedVariant.storage}) - Certified Pre-Owned | Phone Bazar`;
    document.title = titleText;

    const scriptId = 'phonebazar-product-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `${selectedProduct.name} (${selectedVariant.ram} RAM, ${selectedVariant.storage})`,
      image: selectedProduct.images,
      description: selectedProduct.description,
      brand: {
        '@type': 'Brand',
        name: selectedProduct.brand
      },
      sku: selectedVariant.id,
      itemCondition: 'https://schema.org/RefurbishedCondition',
      offers: {
        '@type': 'Offer',
        url: window.location.href,
        priceCurrency: 'INR',
        price: selectedVariant.sellingPrice,
        availability:
          selectedVariant.stock > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Phone Bazar'
        }
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: selectedProduct.rating,
        reviewCount: selectedProduct.reviewCount
      }
    };
    scriptEl.textContent = JSON.stringify(jsonLd);

    return () => {
      document.title = prevTitle;
    };
  }, [selectedProduct, selectedVariant]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft' && selectedProduct?.images && selectedProduct.images.length > 1) {
        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : selectedProduct.images.length - 1));
      }
      if (e.key === 'ArrowRight' && selectedProduct?.images && selectedProduct.images.length > 1) {
        setActiveImageIndex((prev) => (prev < selectedProduct.images.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, selectedProduct]);

  if (!selectedProduct) return null;

  const variants: ProductVariant[] =
    selectedProduct.variants && selectedProduct.variants.length > 0
      ? selectedProduct.variants
      : [
          {
            id: `${selectedProduct.id}_default`,
            ram: selectedProduct.ram || '8GB',
            storage: selectedProduct.storage || '128GB',
            sellingPrice: selectedProduct.sellingPrice,
            originalPrice: selectedProduct.originalPrice,
            discountPercentage: selectedProduct.discountPercentage,
            stock: selectedProduct.stock,
            processor: selectedProduct.specs?.processor,
            condition: selectedProduct.condition,
            batteryHealth: selectedProduct.batteryHealth
          }
        ];

  const activeVariant = selectedVariant || variants[0];
  const currentSellingPrice = activeVariant.sellingPrice;
  const currentOriginalPrice = activeVariant.originalPrice;
  const currentDiscountPct =
    currentOriginalPrice > currentSellingPrice
      ? Math.round(((currentOriginalPrice - currentSellingPrice) / currentOriginalPrice) * 100)
      : activeVariant.discountPercentage;
  const currentSavedAmount = Math.max(0, currentOriginalPrice - currentSellingPrice);
  const currentRam = activeVariant.ram || selectedProduct.ram;
  const currentStorage = activeVariant.storage || selectedProduct.storage;
  const currentStock = activeVariant.stock ?? selectedProduct.stock;
  const currentProcessor = activeVariant.processor || selectedProduct.specs?.processor;
  const currentCondition: DeviceCondition = activeVariant.condition || selectedProduct.condition;
  const currentBatteryHealth = activeVariant.batteryHealth ?? selectedProduct.batteryHealth;

  const isFavorited = isInWishlist(selectedProduct.id);
  const inCompare = isInCompare(selectedProduct.id);
  const images =
    selectedProduct.images && selectedProduct.images.length > 0
      ? selectedProduct.images
      : ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80'];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45 && images.length > 1) {
      setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    } else if (diff < -45 && images.length > 1) {
      setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleBack = () => {
    closeProductPage();
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: `${selectedProduct.name} (${currentRam}/${currentStorage}) - Phone Bazar`,
          text: `Buy certified pre-owned ${selectedProduct.name} (${currentRam}/${currentStorage}, ${currentCondition}) at ₹${currentSellingPrice.toLocaleString('en-IN')} on Phone Bazar!`,
          url
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast('Product link copied to clipboard!');
    }
  };

  const handleAddToCart = () => {
    if (currentStock <= 0) {
      showToast('This variant is currently out of stock.', 'error');
      return;
    }
    addToCart(selectedProduct, 1, currentStorage, selectedColor, {
      selectedRam: currentRam,
      selectedStorage: currentStorage,
      selectedColor,
      selectedVariantId: activeVariant.id,
      variantSellingPrice: currentSellingPrice,
      variantOriginalPrice: currentOriginalPrice
    });
  };

  const handleBuyNow = () => {
    if (currentStock <= 0) {
      showToast('This variant is currently out of stock.', 'error');
      return;
    }
    addToCart(selectedProduct, 1, currentStorage, selectedColor, {
      selectedRam: currentRam,
      selectedStorage: currentStorage,
      selectedColor,
      selectedVariantId: activeVariant.id,
      variantSellingPrice: currentSellingPrice,
      variantOriginalPrice: currentOriginalPrice
    });
    setIsCheckoutOpen(true);
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    setPincodeResult(evaluateIndianPinCode(pincode));
  };

  // Similar products grouped by brand and by price
  const sameBrandProducts = products
    .filter(
      (p) =>
        p.id !== selectedProduct.id &&
        p.brand.toLowerCase().includes(selectedProduct.brand.toLowerCase().split(' ')[0])
    )
    .slice(0, 4);

  const similarPriceProducts = products
    .filter(
      (p) =>
        p.id !== selectedProduct.id &&
        p.brand.toLowerCase() !== selectedProduct.brand.toLowerCase() &&
        Math.abs(p.sellingPrice - currentSellingPrice) <= 7500
    )
    .slice(0, 4);

  const displayedSimilar =
    similarTab === 'brand' && sameBrandProducts.length > 0
      ? sameBrandProducts
      : similarPriceProducts.length > 0
      ? similarPriceProducts
      : sameBrandProducts;

  const conditionBadgeStyle: Record<string, string> = {
    'Like New': 'bg-emerald-50 text-emerald-700 border-emerald-300',
    Excellent: 'bg-sky-50 text-sky-700 border-sky-300',
    'Very Good': 'bg-indigo-50 text-indigo-700 border-indigo-300',
    Good: 'bg-amber-50 text-amber-700 border-amber-300',
    Fair: 'bg-slate-100 text-slate-700 border-slate-300'
  };

  const conditionDescriptionMap: Record<string, string> = {
    'Like New':
      'Zero visible scratches on display or frame. Unboxed flagship appearance with 90%+ certified battery health and 100% original parts.',
    Excellent:
      'Pristine scratch-free screen with barely noticeable micro-signs of gentle use on the frame. 86%+ certified battery health.',
    'Very Good':
      'Clean display with minor light cosmetic marks on the body visible only on close inspection. 100% passed all 32 hardware tests.',
    Good:
      'Value-friendly pre-owned condition with normal everyday signs of wear on body/frame. Screen and all 32 hardware functions work 100% flawlessly.',
    Fair:
      'Visible cosmetic wear on body or frame, priced at maximum discount while passing every functional, camera, network, and battery test.'
  };

  // Complete 16-Field Smartphone Specification Matrix (reflecting active variant!)
  const sixteenSpecificationRows = [
    { label: 'Brand Name', value: selectedProduct.brand },
    { label: 'Model Name', value: selectedProduct.model || selectedProduct.name },
    { label: 'Processor', value: currentProcessor || 'Octa-Core Flagship Mobile Platform' },
    { label: 'Screen Size', value: selectedProduct.specs?.screenSize || '6.5 inches (16.51 cm)' },
    {
      label: 'Display Type',
      value: selectedProduct.specs?.displayType || selectedProduct.specs?.display || '120Hz AMOLED HDR10+ Display'
    },
    { label: 'RAM', value: currentRam },
    { label: 'Internal Storage', value: currentStorage },
    {
      label: 'Battery Capacity',
      value: selectedProduct.specs?.batteryCapacity || selectedProduct.specs?.battery || '4500 mAh Li-Ion'
    },
    {
      label: 'Battery Health',
      value: currentBatteryHealth
        ? `${currentBatteryHealth}% Certified Capacity (Stress-Tested)`
        : 'Battery Health Verified During 32-Point Inspection'
    },
    { label: 'Camera System', value: selectedProduct.specs?.camera || 'Multi-Camera System with OIS & 4K Video' },
    { label: 'Operating System', value: selectedProduct.specs?.os || 'Official OS with Latest Security Update' },
    {
      label: 'Network Connectivity',
      value: selectedProduct.specs?.network || '5G / 4G VoLTE, Dual SIM, Wi-Fi 6, Bluetooth 5.3, NFC'
    },
    { label: 'Launch Year', value: String(selectedProduct.launchYear || '2022') },
    { label: 'Device Condition', value: `${currentCondition} Grade (Phone Bazar 32-Point Certified)` },
    {
      label: 'Warranty / Guarantee',
      value: selectedProduct.warrantyInfo || '7-Day Replacement Guarantee + 6 Months Phone Bazar Service Warranty'
    },
    { label: 'Charging Support', value: selectedProduct.specs?.charging || 'Fast Charging Supported (Adapter & Cable Included)' }
  ];

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-[#FF6A00] selection:text-white flex flex-col">
      {/* STICKY HEADER AT TOP: Back arrow + Official Logo + Breadcrumb + Quick Actions */}
      <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-slate-800 px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={handleBack}
            className="p-2 -ml-1 rounded-xl text-slate-200 hover:text-[#FF6A00] hover:bg-slate-900 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            title="Back to All Smartphones"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden md:inline text-xs font-bold">Back</span>
          </button>

          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 shrink-0 cursor-pointer group"
            title="Phone Bazar Home"
          >
            <img
              src="/assets/aistudio/WhatsApp_Image_2026-11-13_at_5.05.27_PM_f2187aef.jpeg"
              alt="Phone Bazar Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover border border-slate-700 shrink-0"
            />
            <span className="hidden sm:inline text-sm font-extrabold tracking-tight text-white font-display">
              PHONE <span className="text-[#FF6A00]">BAZAR</span>
            </span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0 hidden sm:inline" />

          {/* Breadcrumb: Home > Smartphones > BRAND > MODEL */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center text-xs sm:text-sm font-medium text-slate-400 whitespace-nowrap overflow-x-auto scrollbar-none"
          >
            <button onClick={handleBack} className="hover:text-[#FF6A00] transition-colors cursor-pointer">
              Smartphones
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 mx-1.5 shrink-0" />
            <span className="text-slate-200 font-semibold">{selectedProduct.brand}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 mx-1.5 shrink-0" />
            <span className="text-white font-bold truncate max-w-[140px] sm:max-w-[280px]">
              {selectedProduct.name} ({currentRam} / {currentStorage})
            </span>
          </nav>
        </div>

        {/* Right: Compare, Share, Wishlist, Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => toggleCompare(selectedProduct)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
              inCompare
                ? 'bg-[#FF6A00] text-white border-[#FF6A00]'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
            title="Compare Smartphone"
          >
            <Scale className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{inCompare ? 'Comparing' : 'Compare'}</span>
          </button>

          {compareList.length > 0 && (
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
            >
              View ({compareList.length})
            </button>
          )}

          <button
            onClick={handleShare}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
            title="Share Product"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={() => toggleWishlist(selectedProduct.id)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isFavorited ? 'text-rose-500 bg-rose-500/10' : 'text-slate-300 hover:text-rose-400 hover:bg-slate-900'
            }`}
            title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="hidden md:inline-flex p-2 rounded-xl text-slate-300 hover:text-[#FF6A00] hover:bg-slate-900 transition-colors cursor-pointer relative"
            title="View Cart"
            aria-label="Cart"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      {/* MAIN PRODUCT DETAILS CONTAINER */}
      <main className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12">
        {/* TOP 2-COLUMN HERO LAYOUT: Gallery Left, Pricing & Variant Configuration Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT COLUMN: IMAGE GALLERY (5 cols on lg) */}
          <section aria-label="Product Image Gallery" className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div
              className="relative w-full aspect-square max-h-[460px] bg-gradient-to-b from-slate-50 via-white to-slate-100/70 rounded-3xl border border-slate-200 overflow-hidden flex items-center justify-center p-6 sm:p-10 select-none shadow-xs group cursor-zoom-in"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => {
                setIsLightboxOpen(true);
                setLightboxZoom(1);
              }}
              title="Tap to zoom full screen"
            >
              {/* Top Badges: Discount & Condition */}
              <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
                <span className="bg-[#FF6A00] text-white text-xs font-black px-3 py-1 rounded-lg shadow-sm font-display tracking-tight">
                  {currentDiscountPct}% OFF
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                    conditionBadgeStyle[currentCondition] || 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {currentCondition}
                </span>
              </div>

              {/* Tap to Enlarge Icon Badge */}
              <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-xs text-slate-700 p-2 rounded-xl shadow-xs border border-slate-200 opacity-90 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-4 h-4" />
              </div>

              {/* Main Product Image */}
              <img
                src={images[activeImageIndex]}
                alt={`${selectedProduct.name} (${currentRam} ${currentStorage}) - View ${activeImageIndex + 1}`}
                referrerPolicy="no-referrer"
                onError={handleImageError}
                className="max-h-full max-w-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                loading="eager"
              />

              {/* Left & Right Arrow Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 text-slate-800 hover:text-[#FF6A00] shadow-md border border-slate-200 flex items-center justify-center transition-all cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 text-slate-800 hover:text-[#FF6A00] shadow-md border border-slate-200 flex items-center justify-center transition-all cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image counter indicator */}
              <div className="absolute bottom-3 right-3 z-10 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full">
                {activeImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnails row */}
            {images.length > 1 && (
              <div className="flex items-center justify-center gap-2.5 overflow-x-auto py-1 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-50 border p-1.5 shrink-0 overflow-hidden cursor-pointer transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#FF6A00] ring-2 ring-[#FF6A00]/30 scale-105 bg-white'
                        : 'border-slate-200 hover:border-slate-400 opacity-75 hover:opacity-100'
                    }`}
                    aria-label={`View image thumbnail ${idx + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      onError={handleImageError}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Trust Strip below gallery */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-xs font-extrabold text-slate-900">32-Point</p>
                <p className="text-[11px] text-emerald-700 font-semibold">Quality Certified</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-xs font-extrabold text-slate-900">7-Day</p>
                <p className="text-[11px] text-emerald-700 font-semibold">Replacement</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-xs font-extrabold text-slate-900">6-Month</p>
                <p className="text-[11px] text-emerald-700 font-semibold">Store Warranty</p>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: HEADING, DYNAMIC PRICING, VARIANT SELECTOR, CONDITION, PIN CHECK & EXCHANGE (7 cols on lg) */}
          <section aria-label="Product Configuration & Purchase" className="lg:col-span-7 space-y-6">
            {/* Brand, Title & Rating */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <span className="text-[#FF6A00] bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-md">
                  {selectedProduct.brand}
                </span>
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 32-Point Quality Verified
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-md border ${
                    currentStock > 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {currentStock > 0 ? `In Stock (${currentStock} units available)` : 'Out of Stock'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 font-display tracking-tight">
                {selectedProduct.name}{' '}
                <span className="text-slate-500 font-bold text-xl sm:text-2xl">
                  ({currentRam} / {currentStorage})
                </span>
              </h1>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{selectedProduct.rating}</span>
                </div>
                <span className="font-medium">{selectedProduct.reviewCount} Verified Buyer Reviews</span>
                <span>·</span>
                <span className="text-emerald-700 font-semibold">100% Genuine Indian Unit (Clean IMEI)</span>
              </div>
            </div>

            {/* PRICING CARD (Updates dynamically with selected variant & trade-in) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 text-white border border-slate-800 space-y-3 shadow-lg">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight">
                  ₹{currentSellingPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-base sm:text-xl text-slate-400 line-through">
                  ₹{currentOriginalPrice.toLocaleString('en-IN')}
                </span>
                <span className="bg-[#FF6A00] text-white text-xs sm:text-sm font-extrabold px-3 py-1 rounded-lg">
                  {currentDiscountPct}% OFF
                </span>
                <span className="text-xs sm:text-sm font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/50 px-3 py-1 rounded-lg">
                  You Save ₹{currentSavedAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Inclusive of all GST & taxes
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Free Insured Express Delivery
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Instant UPI, NetBanking & Cards Available
                </span>
              </div>
            </div>

            {/* DYNAMIC VARIANT SELECTION (RAM / STORAGE + COLOR) */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Select RAM & Storage Variant:
                  </span>
                  <span className="text-xs font-bold text-[#FF6A00]">
                    Selected: {currentRam} RAM / {currentStorage} Storage
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {variants.map((variant) => {
                    const isSelected = activeVariant.id === variant.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-slate-950 text-white border-slate-950 ring-2 ring-[#FF6A00] shadow-sm'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-extrabold">
                            {variant.ram} RAM / {variant.storage}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#FF6A00] shrink-0" />}
                        </div>
                        <div className="mt-1.5 flex items-baseline gap-2">
                          <span
                            className={`text-sm font-black ${
                              isSelected ? 'text-[#FF6A00]' : 'text-slate-950'
                            }`}
                          >
                            ₹{variant.sellingPrice.toLocaleString('en-IN')}
                          </span>
                          <span
                            className={`text-[11px] line-through ${
                              isSelected ? 'text-slate-400' : 'text-slate-400'
                            }`}
                          >
                            ₹{variant.originalPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Selection */}
              {selectedProduct.availableColors && selectedProduct.availableColors.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Select Finish / Color:
                    </span>
                    <span className="text-xs font-bold text-slate-900">{selectedColor}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedProduct.availableColors.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setSelectedColor(col)}
                        className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          selectedColor === col
                            ? 'bg-slate-950 text-white border-slate-950 ring-2 ring-[#FF6A00]/40'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PRIMARY PURCHASE BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={currentStock <= 0}
                className="sm:col-span-6 py-4 px-6 bg-[#FF6A00] hover:bg-orange-600 disabled:bg-slate-300 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Zap className="w-5 h-5 fill-white" />
                <span>BUY NOW — ₹{currentSellingPrice.toLocaleString('en-IN')}</span>
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className="sm:col-span-4 py-4 px-5 bg-slate-950 hover:bg-slate-800 disabled:bg-slate-300 text-white font-extrabold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 text-[#FF6A00]" />
                <span>ADD TO CART</span>
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(selectedProduct.id)}
                className={`sm:col-span-2 py-4 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isFavorited
                    ? 'bg-rose-50 border-rose-300 text-rose-600'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span className="sm:hidden">Wishlist</span>
              </button>
            </div>

            {/* SEPARATE DEVICE CONDITION CARD & BATTERY HEALTH CARD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Device Condition Card */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start gap-3.5 shadow-2xs">
                <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Device Condition
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded-md border ${
                        conditionBadgeStyle[currentCondition] || 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {currentCondition}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {conditionDescriptionMap[currentCondition] || conditionDescriptionMap.Excellent}
                  </p>
                </div>
              </div>

              {/* Separate Battery Health Card */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start gap-3.5 shadow-2xs">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <BatteryCharging className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Battery Health Guaranteed
                  </span>
                  <p className="text-base font-black text-slate-950">
                    {currentBatteryHealth
                      ? `${currentBatteryHealth}% Certified Capacity`
                      : 'Verified Healthy Capacity'}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Individually tested for peak voltage stability, zero thermal throttling, and full-day endurance.
                  </p>
                </div>
              </div>
            </div>

            {/* DELIVERY AVAILABILITY (PIN CODE CHECKER) */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-slate-950">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>Check Delivery Availability</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Enter your 6-digit PIN code to check express delivery availability.
                  </p>
                </div>

                <form onSubmit={handleCheckPincode} className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-44">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => {
                        setPincode(e.target.value.replace(/\D/g, ''));
                        setPincodeResult(null);
                      }}
                      placeholder="Enter 6-digit PIN"
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:border-[#FF6A00] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-slate-950 hover:bg-[#FF6A00] text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    Check
                  </button>
                </form>
              </div>

              {pincodeResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold border ${
                    pincodeResult.valid
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  {pincodeResult.message}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* =========================================================================
            COMPLETE 16-FIELD SMARTPHONE SPECIFICATIONS TABLE
            ========================================================================= */}
        <section aria-label="Complete Smartphone Specifications" className="space-y-5 pt-6 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-950 text-[#FF6A00]">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 font-display">
                  Complete Technical Specifications
                </h2>
                <p className="text-xs text-slate-500">
                  Showing verified hardware specifications for{' '}
                  <strong className="text-slate-800">
                    {selectedProduct.name} ({currentRam} RAM / {currentStorage} Storage)
                  </strong>
                </p>
              </div>
            </div>
          </div>

          {/* Product Overview Description */}
          {selectedProduct.description && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p className="font-extrabold text-slate-950 mb-1">Expert Device Summary:</p>
              <p>{selectedProduct.description}</p>
            </div>
          )}

          {/* 16-Field Structured Specification Grid */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200 text-xs sm:text-sm shadow-2xs">
            {sixteenSpecificationRows.map((row, idx) => (
              <div
                key={row.label}
                className={`grid grid-cols-1 sm:grid-cols-12 p-4 gap-1 sm:gap-4 items-center ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                }`}
              >
                <span className="sm:col-span-4 font-bold text-slate-500">{row.label}</span>
                <span className="sm:col-span-8 font-extrabold text-slate-950">{row.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            PRODUCT TRUST & 32-POINT VERIFICATION SECTION
            ========================================================================= */}
        <section aria-label="Product Trust and Verification" className="space-y-5 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 font-display">
                Phone Bazar 32-Point Quality Verification Report
              </h2>
              <p className="text-xs text-slate-500">
                Every pre-owned smartphone passes rigorous lab testing before being listed for sale
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Display & Touch Inspection',
                desc: 'Checked for dead pixels, true-tone accuracy, 10-point multi-touch response, and zero screen burn-in.',
                icon: Smartphone
              },
              {
                title: 'Camera & Optics Check',
                desc: 'Primary, ultra-wide, telephoto, and selfie sensors verified for autofocus, OIS stability, and 4K clarity.',
                icon: Camera
              },
              {
                title: 'Battery & Charging Port',
                desc: 'Load-tested for healthy peak capacity, fast-charging protocol handshake, and clean USB-C / Lightning port.',
                icon: BatteryCharging
              },
              {
                title: 'Network, Audio & Biometrics',
                desc: '5G/4G VoLTE signal lock, Wi-Fi 6, Bluetooth, earpiece, stereo speakers, Face ID / Fingerprint verified 100%.',
                icon: Wifi
              }
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-slate-200 bg-white space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      ✓ PASSED
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-950">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* What's Included in the Box */}
          <div className="p-5 rounded-2xl bg-slate-950 text-white space-y-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#FF6A00]" />
              <h3 className="text-base sm:text-lg font-extrabold font-display">
                What's Included in Your Phone Bazar Box
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  title: `Certified ${selectedProduct.name}`,
                  desc: `${currentRam} / ${currentStorage} (${currentCondition} Grade)`
                },
                {
                  title: 'Compatible Fast Charger & Cable',
                  desc: 'Safety-certified power adapter & data cable'
                },
                {
                  title: '6-Month Warranty Certificate',
                  desc: 'With official GST invoice & 7-Day Replacement seal'
                },
                {
                  title: '32-Point Diagnostic Report',
                  desc: 'Signed technician verification sheet & SIM ejector'
                }
              ].map((boxItem, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <p className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{boxItem.title}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 pl-5">{boxItem.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SIMILAR SMARTPHONES SECTION (Grouped by Brand & Price Relevance)
            ========================================================================= */}
        <section aria-label="Similar Smartphones" className="space-y-5 pt-6 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 font-display">
                Similar Smartphones You May Like
              </h2>
              <p className="text-xs text-slate-500">
                Compare certified pre-owned alternatives by brand or price range
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSimilarTab('brand')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                  similarTab === 'brand'
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                More from {selectedProduct.brand}
              </button>
              <button
                type="button"
                onClick={() => setSimilarTab('price')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                  similarTab === 'price'
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Similar Price Range
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedSimilar.map((p) => {
              const simImg =
                (p.images && p.images[0]) ||
                'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80';
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedProduct(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between hover:border-[#FF6A00] hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="space-y-2.5">
                    <div className="relative w-full aspect-square bg-slate-50 rounded-xl p-3 flex items-center justify-center overflow-hidden">
                      <span className="absolute top-2 left-2 bg-[#FF6A00] text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                        {p.discountPercentage}% OFF
                      </span>
                      <img
                        src={simImg}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        onError={handleImageError}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span className="uppercase">{p.brand}</span>
                      <span className="text-emerald-700">{p.condition}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-950 line-clamp-1 group-hover:text-[#FF6A00] transition-colors">
                      {p.name}
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-500">
                      {p.ram} RAM · {p.storage}
                    </p>
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="text-sm sm:text-base font-black text-slate-950">
                      ₹{p.sellingPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-400 line-through">
                      ₹{p.originalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* STICKY BOTTOM BAR: Variant Price, Official Support & Instant Purchase (Stacked above MobileBottomNav on < md) */}
      <aside
        aria-label="Sticky Purchase Actions"
        className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3.5 py-2.5 sm:px-6 sm:py-3 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-slate-500 truncate">
              {selectedProduct.name} ({currentRam} / {currentStorage})
            </span>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-2xl font-black text-slate-950 font-display tabular-nums">
                ₹{currentSellingPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-slate-400 line-through tabular-nums">
                ₹{currentOriginalPrice.toLocaleString('en-IN')}
              </span>
              <span className="hidden sm:inline text-xs font-bold text-emerald-700">
                · Free Express Delivery
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => openAccountModal('feedback')}
              className="hidden md:flex py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all items-center gap-1.5 cursor-pointer"
              title={`Customer Support (${settings.officialEmail})`}
            >
              <Mail className="w-4 h-4 text-[#FF6A00]" />
              <span>Ask Support</span>
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={currentStock <= 0}
              className="py-2.5 px-3 sm:px-4 border border-slate-300 hover:bg-slate-100 text-slate-900 rounded-xl text-xs sm:text-sm font-extrabold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <ShoppingBag className="w-4 h-4 text-slate-700 shrink-0" />
              <span>Add to Cart</span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={currentStock <= 0}
              className="py-2.5 px-4 sm:px-7 bg-[#FF6A00] hover:bg-orange-600 text-white rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-md flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Zap className="w-4 h-4 fill-white shrink-0" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </aside>

      {/* FULL-SCREEN LIGHTBOX OVERLAY */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="flex items-center justify-between text-white py-2 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs sm:text-sm font-bold">
              {selectedProduct.name} ({currentRam} / {currentStorage}) · Image {activeImageIndex + 1} of{' '}
              {images.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightboxZoom((prev) => Math.min(prev + 0.3, 2.5))}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxZoom((prev) => Math.max(prev - 0.3, 0.7))}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            className="relative flex-1 flex items-center justify-center overflow-hidden my-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[activeImageIndex]}
              alt={selectedProduct.name}
              referrerPolicy="no-referrer"
              onError={handleImageError}
              style={{ transform: `scale(${lightboxZoom})` }}
              className="max-h-[75vh] max-w-[90vw] object-contain transition-transform duration-200"
            />
          </div>

          <div
            className="flex items-center justify-center gap-2 py-2 overflow-x-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveImageIndex(idx);
                  setLightboxZoom(1);
                }}
                className={`w-14 h-14 rounded-lg p-1 bg-white/10 border transition-all cursor-pointer ${
                  activeImageIndex === idx ? 'border-[#FF6A00] scale-105' : 'border-transparent opacity-60'
                }`}
              >
                <img
                  src={img}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={handleImageError}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
