import React from 'react';
import { REVIEWS } from '../data/reviews';
import { Star, CheckCircle2, MessageSquare } from 'lucide-react';

export const CustomerReviews: React.FC = () => {
  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              <MessageSquare className="w-4 h-4 text-[#FF6A00]" />
              <span>Real Experiences From Real Customers</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-950 font-display tracking-tight">
              Customer Reviews & Ratings
            </h2>
          </div>

          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-900">4.9 / 5.0</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-600 font-medium">1,240+ Verified Buyers</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400">{rev.date}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  "{rev.headline}"
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {rev.comment}
                </p>
              </div>

              {/* Author & Model footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span>{rev.customerName}</span>
                    {rev.verifiedBuyer && (
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold" title="Verified Customer">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{rev.location}</span>
                </div>

                <div className="text-right text-[11px] text-slate-500 font-medium max-w-[130px] truncate">
                  {rev.phoneModel}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
