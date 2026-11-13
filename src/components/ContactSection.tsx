import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Mail, MapPin, Send, CheckCircle2, Clock, MessageSquare, ShieldCheck } from 'lucide-react';
import { FeedbackCategory } from '../types';

export const ContactSection: React.FC = () => {
  const { settings, submitFeedback, openAccountModal, showToast } = useStore();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'General enquiry' as FeedbackCategory,
    modelInterest: '',
    message: ''
  });
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      showToast('Please fill in your name, email address, and message.', 'error');
      return;
    }
    const ticket = await submitFeedback({
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
      category: form.category,
      productName: form.modelInterest,
      subject: form.modelInterest ? `${form.category}: ${form.modelInterest}` : form.category,
      message: form.message
    });
    setSubmittedTicket(ticket.id);
  };

  return (
    <section id="contact-section" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6A00] font-display">
            Customer Care & Feedback Desk
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-display tracking-tight">
            Contact & Customer Support
          </h2>
          <p className="text-sm text-slate-600">
            Have questions about a smartphone's condition, battery health, order status, or want to share feedback? Reach our team anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Official Support Channels */}
          <div className="lg:col-span-5 space-y-4">
            {/* Official Email Support */}
            <div className="p-5 bg-slate-950 text-white rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#FF6A00] flex items-center justify-center text-white shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase text-slate-400">
                    Official Business Email
                  </span>
                  <a
                    href={`mailto:${settings.officialEmail}`}
                    className="text-sm font-extrabold text-white block truncate hover:text-[#FF6A00] transition-colors"
                  >
                    {settings.officialEmail}
                  </a>
                  <p className="text-[11px] text-emerald-400">Priority 24/7 Customer Resolution</p>
                </div>
              </div>

              <a
                href={`mailto:${settings.officialEmail}`}
                className="px-3.5 py-2 bg-[#FF6A00] hover:bg-orange-600 text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Email Us
              </a>
            </div>

            {/* Dedicated Feedback & Issue Portal Card */}
            <div className="p-5 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-emerald-800">
                    Feedback & Support Tickets
                  </span>
                  <span className="text-sm font-extrabold text-slate-950 block">
                    Submit Feedback or Complaint
                  </span>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Product, order, delivery & general support
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openAccountModal('feedback')}
                className="px-3.5 py-2 bg-slate-950 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Open Desk
              </button>
            </div>

            {/* Verification & Fulfillment Hub */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
                <MapPin className="w-4 h-4 text-[#FF6A00]" />
                <span>Verification & Fulfillment Hub</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{settings.storeAddress}</p>
              <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2 text-[11px] text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Operating Hours: 10:00 AM – 8:00 PM (All 7 Days)</span>
              </div>
            </div>

            {/* Buyer Protection Guarantee */}
            <div className="p-5 bg-orange-50/60 rounded-2xl border border-orange-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#FF6A00] shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 space-y-1">
                <p className="font-extrabold text-slate-950">7-Day Replacement & 6-Month Warranty</p>
                <p>
                  Every smartphone order is protected by our 32-point hardware verification certificate and hassle-free 7-day replacement guarantee.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Feedback, Complaint & Enquiry Form */}
          <div className="lg:col-span-7 bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200">
            {submittedTicket ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-950 font-display">
                  Request Logged (#{submittedTicket})
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  Thank you, {form.name}! Your {form.category.toLowerCase()} has been recorded and sent to our support team ({settings.officialEmail}).
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSubmittedTicket(null)}
                    className="px-5 py-2.5 bg-slate-950 text-white text-xs font-extrabold rounded-xl cursor-pointer"
                  >
                    Submit Another Message
                  </button>
                  <button
                    type="button"
                    onClick={() => openAccountModal('feedback')}
                    className="px-5 py-2.5 bg-white border border-slate-300 text-slate-800 text-xs font-extrabold rounded-xl cursor-pointer"
                  >
                    View Ticket Status
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-950 font-display">
                      Send Feedback, Report an Issue, or Enquire
                    </h3>
                    <p className="text-xs text-slate-500">
                      Select a category below and share your message with our support specialists.
                    </p>
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as FeedbackCategory })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-[#FF6A00]"
                  >
                    <option value="General enquiry">General enquiry</option>
                    <option value="Submit Feedback">Submit Feedback</option>
                    <option value="Report an Issue">Report an Issue</option>
                    <option value="Product-related complaint">Product-related complaint</option>
                    <option value="Order-related complaint">Order-related complaint</option>
                    <option value="Delivery-related complaint">Delivery-related complaint</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Vikram Verma"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#FF6A00]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. vikram@example.com"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#FF6A00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Mobile Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#FF6A00]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Smartphone Model / Order ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={form.modelInterest}
                      onChange={(e) => setForm({ ...form, modelInterest: e.target.value })}
                      placeholder="e.g. Galaxy S20+ or PB-729401"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#FF6A00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Message *</label>
                  <textarea
                    rows={3}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Share your feedback, product question, or issue details..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 bg-[#FF6A00] hover:bg-orange-600 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit {form.category}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
