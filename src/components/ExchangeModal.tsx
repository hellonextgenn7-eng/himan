import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, ArrowRightLeft, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';
import { getCashifyPriceEstimate } from '../services/cashifyService';

export const ExchangeModal: React.FC = () => {
  const {
    isExchangeModalOpen,
    setIsExchangeModalOpen,
    activeExchange,
    setActiveExchange,
    showToast
  } = useStore();

  const [brand, setBrand] = useState(activeExchange?.brand || 'Apple');
  const [model, setModel] = useState(activeExchange?.model || '');
  const [storage, setStorage] = useState(activeExchange?.storage || '128GB');
  const [screenCondition, setScreenCondition] = useState<'flawless' | 'minor_scratches' | 'cracked'>('flawless');
  const [bodyCondition, setBodyCondition] = useState<'like-new' | 'good' | 'fair'>('good');
  const [batteryStatus, setBatteryStatus] = useState<'healthy' | 'service'>('healthy');
  const [loading, setLoading] = useState(false);
  const [estimatedValue, setEstimatedValue] = useState<number | null>(
    activeExchange?.estimatedValue || null
  );

  if (!isExchangeModalOpen) return null;

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim()) {
      showToast('Please enter your smartphone model name.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await getCashifyPriceEstimate({
        brand,
        model,
        storage,
        physicalCondition: bodyCondition
      });
      let val = res.estimatedValue || 6800;
      if (storage === '256GB') val += 1200;
      if (storage === '512GB') val += 2500;
      if (screenCondition === 'minor_scratches') val = Math.round(val * 0.88);
      if (screenCondition === 'cracked') val = Math.round(val * 0.62);
      if (batteryStatus === 'service') val = Math.round(val * 0.85);
      setEstimatedValue(Math.max(1500, val));
    } catch {
      setEstimatedValue(6000);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDiscount = () => {
    if (!estimatedValue) return;
    setActiveExchange({
      brand,
      model: model.trim(),
      storage,
      condition: bodyCondition,
      screenCondition,
      batteryStatus,
      estimatedValue,
      provider: 'Phone Bazar Instant Trade-In'
    });
    showToast(`₹${estimatedValue.toLocaleString('en-IN')} exchange credit applied to your shopping session!`);
    setIsExchangeModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6A00] flex items-center justify-center text-white">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold font-display">Exchange Your Old Phone</h2>
              <p className="text-xs text-slate-400">
                Get an instant estimated trade-in value and apply it directly to your purchase
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsExchangeModalOpen(false)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCalculate} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">1. Select Brand</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              >
                <option value="Apple">Apple iPhone</option>
                <option value="Samsung">Samsung Galaxy</option>
                <option value="OnePlus">OnePlus</option>
                <option value="Google">Google Pixel</option>
                <option value="Xiaomi">Xiaomi / Redmi</option>
                <option value="Vivo">Vivo</option>
                <option value="OPPO">OPPO</option>
                <option value="Realme">Realme</option>
                <option value="Motorola">Motorola</option>
                <option value="POCO">POCO / iQOO</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">2. Enter Model</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. iPhone 12 / Galaxy S21"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">3. Storage Variant</label>
              <select
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              >
                <option value="64GB">64GB</option>
                <option value="128GB">128GB</option>
                <option value="256GB">256GB</option>
                <option value="512GB">512GB</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">4. Screen Condition</label>
              <select
                value={screenCondition}
                onChange={(e) => setScreenCondition(e.target.value as any)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              >
                <option value="flawless">Flawless Display</option>
                <option value="minor_scratches">Minor Scratches</option>
                <option value="cracked">Cracked / Spots</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">5. Physical Body</label>
              <select
                value={bodyCondition}
                onChange={(e) => setBodyCondition(e.target.value as any)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              >
                <option value="like-new">Like New</option>
                <option value="good">Good (Normal Wear)</option>
                <option value="fair">Fair (Dents / Scuffs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">6. Battery & Functions</label>
              <select
                value={batteryStatus}
                onChange={(e) => setBatteryStatus(e.target.value as any)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              >
                <option value="healthy">100% Working & Good Battery</option>
                <option value="service">Battery Service / Minor Issue</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Doorstep pickup at the time of your new phone delivery</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-slate-950 hover:bg-[#FF6A00] text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
            >
              {loading ? 'Calculating...' : 'Calculate Discount'}
            </button>
          </div>

          {estimatedValue !== null && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-800">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Estimated Exchange Value</span>
                </div>
                <p className="text-2xl font-black text-emerald-950">
                  ₹{estimatedValue.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-emerald-700">
                  For {brand} {model || 'Smartphone'} ({storage})
                </p>
              </div>

              <div className="flex items-center gap-2">
                {activeExchange && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveExchange(null);
                      setEstimatedValue(null);
                    }}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  className="px-5 py-3 rounded-xl bg-[#FF6A00] hover:bg-orange-600 text-white text-xs font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply Discount to Cart & Checkout</span>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
