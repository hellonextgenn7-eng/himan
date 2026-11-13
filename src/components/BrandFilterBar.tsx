import React from 'react';
import { useStore } from '../context/StoreContext';

interface BrandFilterBarProps {
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
}

export const BrandFilterBar: React.FC<BrandFilterBarProps> = ({ selectedBrand, onSelectBrand }) => {
  const { products } = useStore();

  const brands = [
    { id: 'all', name: 'All Brands', count: products.length },
    { id: 'Samsung', name: 'Samsung Galaxy', count: products.filter((p) => p.brand.toLowerCase().includes('samsung')).length },
    { id: 'Realme', name: 'Realme', count: products.filter((p) => p.brand.toLowerCase().includes('realme')).length },
    { id: 'Vivo', name: 'Vivo', count: products.filter((p) => p.brand.toLowerCase().includes('vivo')).length },
    { id: 'OPPO', name: 'OPPO', count: products.filter((p) => p.brand.toLowerCase().includes('oppo')).length },
    { id: 'Motorola', name: 'Motorola', count: products.filter((p) => p.brand.toLowerCase().includes('motorola')).length },
    { id: 'Redmi', name: 'Redmi', count: products.filter((p) => p.brand.toLowerCase().includes('redmi')).length },
    { id: 'POCO', name: 'POCO', count: products.filter((p) => p.brand.toLowerCase().includes('poco')).length },
    { id: 'iQOO', name: 'iQOO', count: products.filter((p) => p.brand.toLowerCase().includes('iqoo')).length },
    { id: 'Apple iPhone', name: 'Apple iPhone', count: products.filter((p) => p.brand.toLowerCase().includes('apple')).length },
    { id: 'OnePlus', name: 'OnePlus', count: products.filter((p) => p.brand.toLowerCase().includes('oneplus')).length }
  ].filter(b => b.id === 'all' || b.count > 0);

  return (
    <section id="brands-section" className="py-6 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-display">
              Shop By Smartphone Brand
            </h3>
            <span className="text-xs text-slate-500 font-normal">
              · 10 Verified Brands
            </span>
          </div>
          {selectedBrand !== 'all' && (
            <button
              onClick={() => onSelectBrand('all')}
              className="text-xs font-semibold text-[#FF6A00] hover:underline cursor-pointer"
            >
              Reset to All Brands
            </button>
          )}
        </div>

        {/* Horizontal scrollable interactive brand pills adhering to interactive filter button rules */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {brands.map((b) => {
            const isActive = selectedBrand === b.id;
            return (
              <button
                key={b.id}
                onClick={() => onSelectBrand(b.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-100'
                }`}
              >
                <span>{b.name}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold tabular-nums ${
                    isActive ? 'bg-[#FF6A00] text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {b.count}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
