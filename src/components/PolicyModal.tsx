import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, ShieldCheck, FileText } from 'lucide-react';

export const PolicyModal: React.FC = () => {
  const { activePolicy, setActivePolicy, settings } = useStore();

  if (!activePolicy) return null;

  const contentMap: Record<string, { title: string; content: React.ReactNode }> = {
    about: {
      title: 'About Phone Bazar',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Welcome to <strong className="text-slate-900">Phone Bazar</strong>, India's trusted marketplace for certified pre-owned and refurbished flagship smartphones.
          </p>
          <p>
            Phone Bazar tests and certifies over 670+ smartphone models across Apple iPhone, Samsung Galaxy, OnePlus, Google Pixel, Xiaomi, Redmi, Realme, Vivo, OPPO, Motorola, POCO, and iQOO.
          </p>
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-900">Our 3 Core Commitments:</h4>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>
                <strong>Zero Counterfeits:</strong> 100% genuine OEM motherboards, displays, camera modules, and clean IMEI verification.
              </li>
              <li>
                <strong>Honest Grading:</strong> Transparent cosmetic grading (Like New, Excellent, Very Good, Good, Fair) and certified battery health.
              </li>
              <li>
                <strong>Consumer Protection:</strong> Every purchase is backed by our 7-Day Replacement Guarantee and 6-Month Store Warranty.
              </li>
            </ul>
          </div>
          <p className="text-xs">
            Official Business Support Email: <strong>{settings.officialEmail}</strong>
          </p>
        </div>
      )
    },
    replacement: {
      title: '7-Day Replacement & Return Policy',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 space-y-1">
              <strong className="block text-sm">Hassle-Free 7-Day Replacement Window</strong>
              <p>
                Every smartphone sold on Phone Bazar comes with a 7-Day Replacement Guarantee starting from the date of delivery.
              </p>
            </div>
          </div>
          <h4 className="font-bold text-slate-900">How to claim a replacement or return:</h4>
          <ol className="list-decimal pl-5 space-y-1.5 text-xs">
            <li>
              Open your Customer Account or write to our official support desk at{' '}
              <strong>{settings.officialEmail}</strong> within 7 calendar days of delivery.
            </li>
            <li>Our technical team will verify the issue and schedule a free reverse doorstep pickup via BlueDart / Delhivery.</li>
            <li>
              Upon inspection at our hub, an identical replacement smartphone is dispatched immediately or a 100% full refund is processed.
            </li>
          </ol>
        </div>
      )
    },
    exchange: {
      title: 'Smartphone Exchange & Trade-In Policy',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Upgrade to your dream smartphone at a smarter price by trading in your existing smartphone through Phone Bazar's instant Exchange Program.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li>
              <strong>Instant Online Valuation:</strong> Select your old phone's brand, model, storage, display condition, and battery health to get an instant trade-in quote.
            </li>
            <li>
              <strong>Immediate Price Deduction:</strong> Apply your exchange quote directly to your cart or product page to reduce your payable amount.
            </li>
            <li>
              <strong>Doorstep Handover:</strong> Back up and factory-reset your old device before handing it over to our courier executive when your new Phone Bazar smartphone arrives.
            </li>
          </ul>
        </div>
      )
    },
    warranty: {
      title: '6-Month Store Warranty Policy',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            All certified pre-owned smartphones include a complimentary{' '}
            <strong className="text-slate-900">6-Month Phone Bazar Service Warranty</strong>.
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">Scope of Warranty:</h4>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Motherboard & processor integrity</li>
              <li>Display touch sensors & logic boards</li>
              <li>Charging IC and internal power delivery</li>
              <li>Camera sensor & autofocus functionality</li>
            </ul>
          </div>
          <p className="text-xs">
            For warranty claims, submit a ticket in the <strong>Feedback & Support</strong> hub or email{' '}
            <strong>{settings.officialEmail}</strong>.
          </p>
        </div>
      )
    },
    shipping: {
      title: 'Shipping & Express Delivery Policy',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>We ship all smartphones in insured, shockproof, tamper-evident packaging across India.</p>
          <ul className="list-disc pl-5 space-y-2 text-xs">
            <li>
              <strong>Free Express Shipping:</strong> ₹0 shipping cost on all smartphone orders nationwide.
            </li>
            <li>
              <strong>Transit Timeline:</strong> Metro cities (Delhi NCR, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad): 24–48 hours. Rest of India: 2–4 business days.
            </li>
            <li>
              <strong>Live Tracking:</strong> Real-time AWB tracking accessible anytime in the Track Order portal.
            </li>
          </ul>
        </div>
      )
    },
    privacy: {
      title: 'Privacy Policy',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            Phone Bazar respects your privacy. We collect customer names, phone numbers, delivery addresses, and emails solely for order fulfillment, courier delivery, and warranty validation.
          </p>
          <p className="text-xs">
            We never sell, rent, or trade your personal data with third-party advertisers. For any privacy enquiries, contact <strong>{settings.officialEmail}</strong>.
          </p>
        </div>
      )
    },
    terms: {
      title: 'Terms and Conditions',
      content: (
        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            By accessing or ordering from Phone Bazar, you agree to our transparent condition grading standards, 7-day replacement guarantee, and 6-month warranty terms.
          </p>
          <p className="text-xs">
            All devices sold are genuine pre-owned smartphones with verified clean IMEIs. Official customer support is available via <strong>{settings.officialEmail}</strong>.
          </p>
        </div>
      )
    }
  };

  const current = contentMap[activePolicy] || contentMap.about;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FF6A00]" />
            <h3 className="text-lg font-extrabold text-slate-900 font-display">{current.title}</h3>
          </div>
          <button
            onClick={() => setActivePolicy(null)}
            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto pr-2">{current.content}</div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setActivePolicy(null)}
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
