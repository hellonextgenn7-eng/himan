import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { Flame, Sparkles, Smartphone, ArrowRight } from 'lucide-react';

interface CuratedShowcasesProps {
  onExploreMore: (brand?: string) => void;
}

export const CuratedShowcases: React.FC<CuratedShowcasesProps> = ({ onExploreMore }) => {
  const { products } = useStore();

  // Ensure Samsung Galaxy S20+ (₹14,999 / ₹39,900 62% OFF) is featured prominently in Best Deals
  const s20Plus = products.find((p) => p.name.toLowerCase().includes('galaxy s20+'));
  const otherDeals = products
    .filter((p) => p.id !== s20Plus?.id && p.discountPercentage >= 55)
    .slice(0, s20Plus ? 3 : 4);
  const bestDeals = s20Plus ? [s20Plus, ...otherDeals] : otherDeals;

  // 2. iPhone Flagship Collection
  const iphones = products
    .filter((p) => p.brand.toLowerCase().includes('apple'))
    .slice(0, 4);

  // 3. Samsung Galaxy Collection
  const samsungs = products
    .filter((p) => p.brand.toLowerCase().includes('samsung'))
    .slice(0, 4);

  // 4. Google Pixel, OnePlus & Xiaomi Flagships
  const androidFlagships = products
    .filter((p) =>
      ['OnePlus', 'Google', 'Xiaomi', 'Motorola', 'Vivo', 'iQOO'].some((b) =>
        p.brand.toLowerCase().includes(b.toLowerCase())
      )
    )
    .sort((a, b) => b.sellingPrice - a.sellingPrice)
    .slice(0, 4);

  return (
    <div className="space-y-16 py-8">
      {/* 1. BEST DEALS SHELF */}
      <section id="best-deals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#FF6A00] mb-1">
              <Flame className="w-4 h-4 fill-[#FF6A00]" />
              <span>Limited Time Price Drops</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display tracking-tight">
              Best Deals · Up to 75% Off
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Featured deal: Samsung Galaxy S20+ at ₹14,999 (62% OFF, Save ₹24,901) with 7-day replacement guarantee.
            </p>
          </div>

          <button
            onClick={() => onExploreMore()}
            className="text-xs sm:text-sm font-bold text-[#FF6A00] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>View All Deals</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestDeals.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 2. APPLE IPHONE COLLECTION SHELF */}
      <section className="bg-slate-50 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                <Smartphone className="w-4 h-4 text-slate-900" />
                <span>Certified Pre-Owned Apple</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display tracking-tight">
                Apple iPhone Collection
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                From iPhone 11 to 16 Pro Max. Tested for authentic battery health, Face ID, and True Tone.
              </p>
            </div>

            <button
              onClick={() => onExploreMore('Apple')}
              className="text-xs sm:text-sm font-bold text-slate-900 hover:text-[#FF6A00] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>
                Explore All iPhones ({products.filter((p) => p.brand.toLowerCase().includes('apple')).length})
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {iphones.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. SAMSUNG GALAXY COLLECTION SHELF */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-sky-600 mb-1">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Dynamic AMOLED & S-Pen Flagships</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display tracking-tight">
              Samsung Galaxy Series
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Galaxy S20+, S21, S22, S23, S24 Ultra & foldables. 120Hz AMOLED displays & verified battery health.
            </p>
          </div>

          <button
            onClick={() => onExploreMore('Samsung')}
            className="text-xs sm:text-sm font-bold text-sky-700 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>
              Explore All Samsung ({products.filter((p) => p.brand.toLowerCase().includes('samsung')).length})
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {samsungs.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 4. PREMIUM ANDROID POWERHOUSES */}
      <section className="bg-slate-900 text-white py-12 rounded-3xl mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#FF6A00] mb-1">
                <Flame className="w-4 h-4" />
                <span>Flagship Androids</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
                OnePlus, Google Pixel & Xiaomi Flagships
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Pure computational photography, 100W SuperVOOC flash charging, and Hasselblad / Leica camera optics.
              </p>
            </div>

            <button
              onClick={() => onExploreMore('OnePlus')}
              className="text-xs sm:text-sm font-bold text-[#FF6A00] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Explore All Flagships</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-900">
            {androidFlagships.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
