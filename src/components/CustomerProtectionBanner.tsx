import React from 'react';
import { ShieldCheck, RefreshCw, Percent, FileText, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CustomerProtectionBanner: React.FC = () => {
  const { setActivePolicy } = useStore();

  return (
    <section
      aria-label="6-Month Customer Protection Guarantee"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2"
    >
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border border-slate-800/90 shadow-xl p-5 sm:p-6 lg:px-8 lg:py-6">
        {/* Subtle signature orange ambient glow */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#FF6A00]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-56 h-56 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left Icon + Policy Copy */}
          <div className="flex items-start gap-3.5 sm:gap-4 flex-1">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-[#FF6A00]/15 border border-[#FF6A00]/40 flex items-center justify-center shrink-0 shadow-inner mt-0.5">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF6A00]" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FF6A00] text-white text-[11px] font-extrabold uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" /> Official Store Guarantee
                </span>
                <h3 className="text-base sm:text-lg lg:text-xl font-extrabold text-white font-display tracking-tight">
                  6-Month Customer Protection Guarantee
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
                Shop with confidence! If your smartphone develops an eligible functional issue within{' '}
                <strong className="text-white font-extrabold underline decoration-[#FF6A00] decoration-2 underline-offset-2">
                  6 months of purchase
                </strong>
                , excluding display and battery-related issues, you may choose a{' '}
                <strong className="text-[#FF6A00] font-extrabold">replacement phone</strong> or receive a{' '}
                <strong className="text-[#FF6A00] font-extrabold">
                  70% refund of the phone&apos;s purchase price
                </strong>
                , subject to our applicable terms and conditions.
              </p>
            </div>
          </div>

          {/* Right Key Highlights & Terms Link */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-2.5 sm:gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800/80 shrink-0">
            <div className="flex items-center gap-2">
              <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#FF6A00] shrink-0" />
                <div>
                  <div className="text-xs font-extrabold text-white leading-none tabular-nums">6 Months</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Phone Replacement</div>
                </div>
              </div>

              <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-extrabold text-emerald-400 leading-none tabular-nums">
                    70% Refund
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Guaranteed Value</div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActivePolicy('warranty')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Terms &amp; Conditions Apply</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
