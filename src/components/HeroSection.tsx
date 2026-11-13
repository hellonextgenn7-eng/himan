import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight, Flame, ShieldCheck, Tag, CheckCircle2, Star, Sparkles, Smartphone, Award } from 'lucide-react';
import { LargeSearchBar } from './LargeSearchBar';
import { handleImageError } from '../utils/imageFallback';

interface HeroSectionProps {
  onExploreClick: () => void;
  onBestDealsClick: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onBestDealsClick,
  searchQuery,
  onSearchChange,
  onSearchSubmit
}) => {
  const { products, setSelectedProduct } = useStore();

  // Selected flagship devices for the multi-angle visual arrangement
  const centerPhone = products.find((p) => p.model === 'iPhone 15 Pro Max') || products[7] || products[0];
  const leftPhone = products.find((p) => p.model === 'Galaxy S24 Ultra') || products[10] || products[1];
  const rightPhone = products.find((p) => p.model === 'OnePlus 12') || products[16] || products[2];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#070709] via-[#0E1015] to-[#0A0A0D] text-white pt-4 pb-8 lg:pt-6 lg:pb-10">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#FF6A00]/15 via-amber-500/10 to-orange-600/15 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-6 right-10 w-60 h-60 bg-sky-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-5 sm:space-y-6">
        
        {/* SECTION 1: PROMINENT SEARCH BAR AT THE VERY TOP (Directly above 4.9/5 Rating Badge) */}
        <div className="relative z-30">
          <LargeSearchBar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onSearchSubmit={onSearchSubmit}
          />
        </div>

        {/* Top Header Block: Concise, Sleek Text Section */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3 relative z-20">
          
          {/* Trust Kicker Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-[11px] sm:text-xs font-semibold text-slate-200 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#FF6A00]" />
            <span>India's Premium Certified Pre-Owned Smartphone Hub</span>
            <span className="text-slate-500">·</span>
            <span className="text-amber-400 flex items-center gap-1 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9/5 Rating
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-display text-white leading-tight">
            Your Dream Smartphone. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-slate-100 to-[#FF6A00] bg-clip-text text-transparent">
              At A Smarter Price.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto font-normal">
            Explore premium pre-owned smartphones at unbeatable prices.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <button
              onClick={onExploreClick}
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold text-xs sm:text-sm rounded-full shadow-lg hover:shadow-orange-500/25 transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Explore Smartphones</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onBestDealsClick}
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs sm:text-sm rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-md transform hover:-translate-y-0.5"
            >
              <Flame className="w-4 h-4 text-[#FF6A00]" />
              <span>View Best Deals</span>
            </button>
          </div>

          {/* Small Trust Section */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-1.5 text-[11px] sm:text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quality Checked Phones</span>
            </div>
            <span className="text-slate-600">·</span>
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <Tag className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Best Value Deals</span>
            </div>
            <span className="text-slate-600">·</span>
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Trusted Shopping</span>
            </div>
          </div>

        </div>

        {/* Sleek Visual Showcase: Multi-Smartphone Dynamic Arrangement */}
        <div className="relative pt-2 pb-1 z-10">
          
          {/* Subtle Reflective Platform Floor */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 max-w-4xl h-16 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent rounded-[100%] blur-xl opacity-90 pointer-events-none" />

          {/* Three-Phone Product Arrangement */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center max-w-5xl mx-auto">
            
            {/* Left Phone: Samsung Flagship */}
            <div className="hidden md:flex md:col-span-3 flex-col items-center animate-float-gentle">
              <div
                onClick={() => setSelectedProduct(leftPhone)}
                className="group relative w-full max-w-[210px] bg-gradient-to-b from-slate-800/40 to-slate-900/80 border border-slate-700/60 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xl backdrop-blur-md hover:border-[#FF6A00]/50 transition-all cursor-pointer transform -rotate-3 hover:rotate-0 hover:scale-105"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 uppercase font-bold tracking-wider">{leftPhone.brand}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800 text-[10px]">
                    {leftPhone.condition}
                  </span>
                </div>

                <div className="relative w-full h-36 flex items-center justify-center p-1.5 my-1">
                  <img
                    src={leftPhone.images[0]}
                    alt={leftPhone.name}
                    referrerPolicy="no-referrer"
                    onError={handleImageError}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
                  />
                </div>

                <div className="text-center space-y-0.5">
                  <p className="text-xs font-bold text-white truncate">{leftPhone.name}</p>
                  <p className="text-sm font-extrabold text-[#FF6A00] font-display tabular-nums">
                    ₹{leftPhone.sellingPrice.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Central Dominant Hero Phone */}
            <div className="md:col-span-6 flex flex-col items-center relative z-20">
              <div
                onClick={() => setSelectedProduct(centerPhone)}
                className="group relative w-full max-w-md bg-gradient-to-b from-slate-800/60 via-slate-900/90 to-slate-950 border-2 border-slate-700 hover:border-[#FF6A00] rounded-3xl p-4 sm:p-5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-all cursor-pointer transform hover:scale-[1.01]"
              >
                {/* Floating Top Badge */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF6A00]" />
                    <span className="text-[11px] uppercase font-extrabold tracking-wider text-slate-200 font-display">
                      Featured Pre-Owned Flagship
                    </span>
                  </div>
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#FF6A00] text-white">
                    {centerPhone.discountPercentage}% OFF
                  </span>
                </div>

                {/* Compact Uncropped Product Visual */}
                <div className="relative w-full h-44 sm:h-52 flex items-center justify-center p-2 my-1">
                  <img
                    src={centerPhone.images[0]}
                    alt={centerPhone.name}
                    referrerPolicy="no-referrer"
                    onError={handleImageError}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_16px_28px_rgba(255,106,0,0.25)] transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Floating spec bubble left */}
                  <div className="absolute left-2 top-6 bg-slate-950/90 border border-slate-700/80 px-2 py-1 rounded-xl text-[10px] font-semibold text-slate-300 shadow-lg backdrop-blur-md hidden sm:block">
                    ⚡ {centerPhone.ram} · {centerPhone.storage}
                  </div>

                  {/* Floating spec bubble right */}
                  {centerPhone.batteryHealth && (
                    <div className="absolute right-2 bottom-6 bg-slate-950/90 border border-emerald-800 px-2 py-1 rounded-xl text-[10px] font-bold text-emerald-400 shadow-lg backdrop-blur-md hidden sm:block">
                      🔋 {centerPhone.batteryHealth}% Battery Health
                    </div>
                  )}
                </div>

                {/* Bottom Details & Instant Action */}
                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#FF6A00] transition-colors">
                      {centerPhone.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Grade: <span className="text-emerald-400 font-semibold">{centerPhone.condition}</span> · 7-Day Guarantee
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] text-slate-500 line-through tabular-nums">
                      ₹{centerPhone.originalPrice.toLocaleString('en-IN')}
                    </div>
                    <div className="text-lg sm:text-xl font-extrabold text-[#FF6A00] font-display tabular-nums">
                      ₹{centerPhone.sellingPrice.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Quick inspect button */}
                <div className="mt-2.5 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 32-Point Certified & Inspected
                  </span>
                  <span className="text-[#FF6A00] font-bold group-hover:underline flex items-center gap-1">
                    Inspect Specs →
                  </span>
                </div>
              </div>
            </div>

            {/* Right Phone: OnePlus / Pixel Flagship */}
            <div className="hidden md:flex md:col-span-3 flex-col items-center animate-float-reverse">
              <div
                onClick={() => setSelectedProduct(rightPhone)}
                className="group relative w-full max-w-[210px] bg-gradient-to-b from-slate-800/40 to-slate-900/80 border border-slate-700/60 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xl backdrop-blur-md hover:border-[#FF6A00]/50 transition-all cursor-pointer transform rotate-3 hover:rotate-0 hover:scale-105"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 uppercase font-bold tracking-wider">{rightPhone.brand}</span>
                  <span className="px-1.5 py-0.5 rounded bg-orange-950 text-orange-400 font-bold border border-orange-800 text-[10px]">
                    {rightPhone.condition}
                  </span>
                </div>

                <div className="relative w-full h-36 flex items-center justify-center p-1.5 my-1">
                  <img
                    src={rightPhone.images[0]}
                    alt={rightPhone.name}
                    referrerPolicy="no-referrer"
                    onError={handleImageError}
                    className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
                  />
                </div>

                <div className="text-center space-y-0.5">
                  <p className="text-xs font-bold text-white truncate">{rightPhone.name}</p>
                  <p className="text-sm font-extrabold text-[#FF6A00] font-display tabular-nums">
                    ₹{rightPhone.sellingPrice.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
