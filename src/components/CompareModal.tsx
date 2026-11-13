import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Scale, Trash2, ShoppingBag, ExternalLink } from 'lucide-react';
import { handleImageError } from '../utils/imageFallback';

export const CompareModal: React.FC = () => {
  const {
    compareList,
    toggleCompare,
    clearCompare,
    isCompareModalOpen,
    setIsCompareModalOpen,
    openProductPage,
    addToCart
  } = useStore();

  if (!isCompareModalOpen) return null;

  const specRows = [
    { label: 'Brand', get: (p: any) => p.brand },
    { label: 'Condition Grade', get: (p: any) => p.condition },
    { label: 'Battery Health', get: (p: any) => `${p.batteryHealth || 88}% Certified` },
    { label: 'RAM', get: (p: any) => p.ram },
    { label: 'Internal Storage', get: (p: any) => p.storage },
    { label: 'Processor', get: (p: any) => p.specs?.processor || 'Flagship SoC' },
    { label: 'Screen Size', get: (p: any) => p.specs?.screenSize || '6.5 inches' },
    { label: 'Display Type', get: (p: any) => p.specs?.displayType || p.specs?.display },
    { label: 'Camera System', get: (p: any) => p.specs?.camera },
    { label: 'Battery Capacity', get: (p: any) => p.specs?.batteryCapacity || p.specs?.battery },
    { label: 'Charging Support', get: (p: any) => p.specs?.charging },
    { label: 'Operating System', get: (p: any) => p.specs?.os },
    { label: 'Network', get: (p: any) => p.specs?.network },
    { label: 'Launch Year', get: (p: any) => String(p.launchYear || '2022') },
    { label: 'Warranty', get: (p: any) => '7-Day Replacement + 6M Warranty' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-[#FF6A00]" />
            <h2 className="text-base sm:text-lg font-extrabold font-display">
              Compare Smartphones Side-by-Side ({compareList.length}/3)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {compareList.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-300 hover:text-rose-300 text-xs font-bold cursor-pointer"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsCompareModalOpen(false)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 overflow-auto flex-1">
          {compareList.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Scale className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-extrabold text-slate-900">No Smartphones Selected for Comparison</p>
              <p className="text-xs text-slate-500">
                Click the "Compare" icon on up to 3 smartphones in the catalog to compare specs side-by-side.
              </p>
            </div>
          ) : (
            <div className="min-w-[640px] border border-slate-200 rounded-2xl overflow-hidden">
              {/* Top Product Cards Row */}
              <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200">
                <div className="col-span-3 p-4 font-extrabold text-xs uppercase text-slate-500 flex items-center">
                  Smartphone Model
                </div>
                {compareList.map((p) => (
                  <div
                    key={p.id}
                    className="col-span-3 p-4 border-l border-slate-200 bg-white flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="relative h-28 bg-slate-50 rounded-xl p-2 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => toggleCompare(p)}
                          className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-white text-slate-500 hover:text-rose-600 shadow-2xs cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <img
                          src={p.images?.[0]}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          onError={handleImageError}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-950 line-clamp-1">
                        {p.name}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-black text-[#FF6A00]">
                          ₹{p.sellingPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-slate-400 line-through">
                          ₹{p.originalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCompareModalOpen(false);
                          openProductPage(p);
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" /> Details
                      </button>
                      <button
                        type="button"
                        onClick={() => addToCart(p, 1, p.storage, p.color)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-[#FF6A00] text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" /> Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Specification Rows */}
              {specRows.map((row, idx) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-12 text-xs ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'
                  } border-b border-slate-100 last:border-b-0`}
                >
                  <div className="col-span-3 p-3.5 font-bold text-slate-500">{row.label}</div>
                  {compareList.map((p) => (
                    <div
                      key={p.id}
                      className="col-span-3 p-3.5 border-l border-slate-200 font-bold text-slate-900"
                    >
                      {row.get(p)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
