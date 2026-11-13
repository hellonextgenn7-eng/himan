import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowRight } from 'lucide-react';
import { handleImageError } from '../utils/imageFallback';

interface VisualBrandCardsProps {
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
}

export const VisualBrandCards: React.FC<VisualBrandCardsProps> = ({ selectedBrand, onSelectBrand }) => {
  const { products } = useStore();

  const brandDefinitions = [
    {
      id: 'Apple',
      name: 'Apple iPhone',
      monogram: 'iOS',
      tagline: 'iPhone 11 to 16 Pro Max',
      match: (b: string) => b.toLowerCase().includes('apple')
    },
    {
      id: 'Samsung',
      name: 'Samsung Galaxy',
      monogram: 'GALAXY',
      tagline: 'Galaxy S, Z Fold & A Series',
      match: (b: string) => b.toLowerCase().includes('samsung')
    },
    {
      id: 'OnePlus',
      name: 'OnePlus',
      monogram: '1+',
      tagline: 'Flagship Nord & Number Series',
      match: (b: string) => b.toLowerCase().includes('oneplus')
    },
    {
      id: 'Google',
      name: 'Google Pixel',
      monogram: 'PIXEL',
      tagline: 'Pure Tensor AI & Pro Camera',
      match: (b: string) => b.toLowerCase().includes('google') || b.toLowerCase().includes('pixel')
    },
    {
      id: 'Xiaomi',
      name: 'Xiaomi',
      monogram: 'MI',
      tagline: 'Leica Optics & HyperCharge',
      match: (b: string) => b.toLowerCase().includes('xiaomi')
    },
    {
      id: 'Redmi',
      name: 'Redmi',
      monogram: 'REDMI',
      tagline: 'Note Pro & All-Round Value',
      match: (b: string) => b.toLowerCase().includes('redmi')
    },
    {
      id: 'Realme',
      name: 'Realme',
      monogram: 'REALME',
      tagline: 'GT Pro & Narzo Speed Series',
      match: (b: string) => b.toLowerCase().includes('realme')
    },
    {
      id: 'Vivo',
      name: 'Vivo',
      monogram: 'VIVO',
      tagline: 'ZEISS X-Series & V Portrait',
      match: (b: string) => b.toLowerCase().includes('vivo')
    },
    {
      id: 'OPPO',
      name: 'OPPO',
      monogram: 'OPPO',
      tagline: 'Reno Pro & Find Flagships',
      match: (b: string) => b.toLowerCase().includes('oppo')
    },
    {
      id: 'Motorola',
      name: 'Motorola',
      monogram: 'MOTO',
      tagline: 'Edge Fusion & Moto G 5G',
      match: (b: string) => b.toLowerCase().includes('motorola')
    },
    {
      id: 'POCO',
      name: 'POCO',
      monogram: 'POCO',
      tagline: 'F & X Series Gaming Power',
      match: (b: string) => b.toLowerCase().includes('poco')
    },
    {
      id: 'iQOO',
      name: 'iQOO',
      monogram: 'iQOO',
      tagline: 'Neo & Snapdragon Gaming',
      match: (b: string) => b.toLowerCase().includes('iqoo')
    }
  ];

  const brandCatalog = brandDefinitions
    .map((def) => {
      const matching = products.filter((p) => def.match(p.brand));
      return {
        ...def,
        count: matching.length,
        sampleImage:
          matching[0]?.images?.[0] ||
          'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80'
      };
    })
    .filter((b) => b.count > 0);

  const handleBrandCardClick = (brandId: string) => {
    onSelectBrand(brandId);
    const catalogEl = document.getElementById('smartphones-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="brands-section" className="py-12 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#FF6A00]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">
                Official Brand Storefronts
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display tracking-tight">
              Shop By Smartphone Brand
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Select your favorite smartphone brand to filter certified pre-owned models
            </p>
          </div>

          {selectedBrand !== 'all' && (
            <button
              onClick={() => onSelectBrand('all')}
              className="text-xs font-extrabold text-[#FF6A00] hover:underline cursor-pointer"
            >
              Show All Brands ({products.length} Smartphones)
            </button>
          )}
        </div>

        {/* Visual Brand Grid (All 12 Brands) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {brandCatalog.map((b) => {
            const isSelected =
              selectedBrand.toLowerCase() === b.id.toLowerCase() ||
              selectedBrand.toLowerCase() === b.name.toLowerCase();
            return (
              <div
                key={b.id}
                onClick={() => handleBrandCardClick(b.id)}
                className={`group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden border ${
                  isSelected
                    ? 'bg-slate-950 text-white border-slate-950 ring-2 ring-[#FF6A00] shadow-md'
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-[#FF6A00] shadow-2xs hover:shadow-md'
                }`}
              >
                {/* Brand Monogram Pill + Name */}
                <div className="space-y-1 relative z-10">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md tracking-wider ${
                        isSelected
                          ? 'bg-[#FF6A00] text-white'
                          : 'bg-slate-900 text-white group-hover:bg-[#FF6A00]'
                      }`}
                    >
                      {b.monogram}
                    </span>
                    <span
                      className={`text-[10px] font-bold tabular-nums ${
                        isSelected ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {b.count}
                    </span>
                  </div>
                  <h3
                    className={`text-sm font-extrabold font-display truncate pt-1 ${
                      isSelected ? 'text-white' : 'text-slate-950 group-hover:text-[#FF6A00]'
                    }`}
                  >
                    {b.name}
                  </h3>
                  <p
                    className={`text-[10px] font-medium truncate ${
                      isSelected ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {b.tagline}
                  </p>
                </div>

                {/* Smartphone Visual */}
                <div className="relative w-full h-24 my-2 flex items-center justify-center p-1">
                  <img
                    src={b.sampleImage}
                    alt={b.name}
                    referrerPolicy="no-referrer"
                    onError={handleImageError}
                    className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)]"
                    loading="lazy"
                  />
                </div>

                {/* Footer Count */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 text-[11px] relative z-10">
                  <span
                    className={`font-bold tabular-nums ${
                      isSelected ? 'text-[#FF6A00]' : 'text-slate-600'
                    }`}
                  >
                    {b.count} Phones
                  </span>
                  <span
                    className={`text-[10px] font-extrabold ${
                      isSelected ? 'text-white' : 'text-slate-500 group-hover:text-[#FF6A00]'
                    } flex items-center gap-0.5`}
                  >
                    Explore <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
