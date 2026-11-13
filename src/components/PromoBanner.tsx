import React from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { handleImageError } from '../utils/imageFallback';

interface PromoBannerProps {
  onActionClick: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onActionClick }) => {
  const { products, setSelectedProduct } = useStore();

  const showcasePhone = products.find((p) => p.model === 'iPhone 15 Pro Max') || products[7] || products[0];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border border-slate-800 p-8 sm:p-12 shadow-2xl">
        
        {/* Subtle orange ambient glow */}
        <div className="absolute right-10 top-0 w-96 h-96 bg-[#FF6A00]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/80 border border-orange-800/80 text-orange-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Flagship Upgrade Festival · Limited Stock</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-tight">
              Upgrade To iPhone 15 & S24 Ultra. <br className="hidden sm:inline" />
              Save Up To 50% Compared to Brand New.
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto lg:mx-0 leading-relaxed font-normal">
              Get aerospace titanium, 120Hz ProMotion displays, and 200MP camera systems with our verified 32-point inspection and 7-day doorstep replacement guarantee.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onActionClick}
                className="px-6 py-3.5 bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold text-xs sm:text-sm rounded-full transition-all shadow-md flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Shop Flagship Series</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>6 Months Store Warranty Included</span>
              </div>
            </div>
          </div>

          {/* Right Product Visual (Completely uncropped, full view) */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              onClick={() => setSelectedProduct(showcasePhone)}
              className="group relative w-64 h-64 sm:w-72 sm:h-72 p-4 bg-slate-900/60 rounded-3xl border border-slate-800/80 hover:border-[#FF6A00]/60 transition-all cursor-pointer flex items-center justify-center shadow-xl transform hover:scale-105"
            >
              <img
                src={showcasePhone.images[0]}
                alt={showcasePhone.name}
                referrerPolicy="no-referrer"
                onError={handleImageError}
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_15px_30px_rgba(255,106,0,0.2)]"
              />
              <div className="absolute bottom-3 text-center">
                <span className="text-[11px] font-bold text-white bg-slate-950/90 border border-slate-700 px-3 py-1 rounded-full shadow-md">
                  {showcasePhone.name} · ₹{showcasePhone.sellingPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
