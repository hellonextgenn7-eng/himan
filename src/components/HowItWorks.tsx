import React from 'react';
import { Smartphone, CheckCircle, CreditCard, PackageCheck, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      icon: <Smartphone className="w-5 h-5 text-[#FF6A00]" />,
      title: 'Select Your Smartphone',
      desc: 'Browse our catalog of 50+ pre-owned flagships across Apple, Samsung, OnePlus, Google, and more with actual specifications and pricing.'
    },
    {
      step: '02',
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      title: 'Verify Grade & Battery',
      desc: 'Each listing clearly displays physical condition (Like New, Excellent, Good), battery health percentage, and included accessories.'
    },
    {
      step: '03',
      icon: <CreditCard className="w-5 h-5 text-sky-500" />,
      title: 'Flexible Payment / COD',
      desc: 'Checkout smoothly with Razorpay, instant UPI (Google Pay / PhonePe), or select Cash on Delivery with ₹0 advance payment.'
    },
    {
      step: '04',
      icon: <PackageCheck className="w-5 h-5 text-purple-500" />,
      title: '7 Days Peace of Mind',
      desc: 'Receive your phone in certified tamper-proof packaging. Test every feature for 7 days with our 100% replacement guarantee.'
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00] font-display">
            Simple & Transparent Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-display tracking-tight">
            How Buying at Phone Bazar Works
          </h2>
          <p className="text-sm text-slate-600">
            From picking your favorite smartphone to doorstep delivery in 4 clear steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((st, index) => (
            <div
              key={index}
              className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 relative flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                    {st.icon}
                  </div>
                  <span className="text-2xl font-extrabold text-slate-300 font-display">
                    {st.step}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-950 font-display">
                  {st.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {st.desc}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
