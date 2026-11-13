import React from 'react';
import { RotateCcw, ShieldCheck, CheckCircle2, Truck, Smartphone, Lock, Award } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: <RotateCcw className="w-6 h-6 text-[#FF6A00]" />,
      title: '7-Day Replacement Guarantee',
      desc: 'Test your phone with complete peace of mind. If any defect appears within 7 days, get an instant replacement or full refund.'
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
      title: '32-Point Rigorous Testing',
      desc: 'Every smartphone undergoes automated and manual diagnostic testing for battery health, screen touch, cameras, biometric sensors, and connectivity.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-sky-500" />,
      title: '6 to 12 Months Warranty',
      desc: 'Comprehensive Phone Bazar store warranty covering internal components, motherboard, and repair assistance.'
    },
    {
      icon: <Award className="w-6 h-6 text-amber-500" />,
      title: '100% Genuine OEM Parts',
      desc: 'Zero fake screens or cheap duplicate batteries. Every device features verified authentic original components.'
    },
    {
      icon: <Truck className="w-6 h-6 text-purple-500" />,
      title: 'Free Express Shipping',
      desc: 'Insured shock-proof courier packaging with real-time tracking dispatched via BlueDart and Delhivery across all 28 states.'
    },
    {
      icon: <Lock className="w-6 h-6 text-rose-500" />,
      title: 'Cash on Delivery & Razorpay',
      desc: 'Pay safely using UPI, credit/debit cards with 256-bit encryption, or choose Cash on Delivery at your doorstep.'
    }
  ];

  return (
    <section id="why-choose-us" className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-xs font-bold text-orange-900">
            <Smartphone className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span>Why Buy From Phone Bazar?</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-display tracking-tight">
            The Safest Way to Buy Pre-Owned Flagships
          </h2>

          <p className="text-base text-slate-600">
            We eliminate all risks of buying second-hand phones through transparent grading, genuine hardware inspection, and a consumer-first 7-day guarantee.
          </p>
        </div>

        {/* Feature Cards Grid adhering to single-elevation depth rule §1.C */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                {feat.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                {feat.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
