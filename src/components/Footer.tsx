import React from 'react';
import { useStore } from '../context/StoreContext';
import { Smartphone, Mail, MapPin, ShieldCheck, MessageSquare, ArrowRightLeft } from 'lucide-react';

interface FooterProps {
  onSelectBrand?: (brand: string) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectBrand }) => {
  const {
    settings,
    setActivePolicy,
    setIsOrderTrackingOpen,
    setIsExchangeModalOpen,
    openAccountModal,
    setIsAdminViewOpen
  } = useStore();

  const brands = [
    'Apple iPhone',
    'Samsung Galaxy',
    'OnePlus',
    'Google Pixel',
    'Xiaomi',
    'Redmi',
    'Realme',
    'Vivo',
    'OPPO',
    'Motorola',
    'POCO',
    'iQOO'
  ];

  const handleBrandClick = (brandName: string) => {
    const rawBrand = brandName.split(' ')[0];
    if (onSelectBrand) {
      onSelectBrand(rawBrand);
    }
    const catEl = document.getElementById('smartphones-catalog');
    if (catEl) catEl.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Col 1: Brand & Official Business Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FF6A00] flex items-center justify-center text-white font-bold">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white font-display tracking-tight">
                PHONE <span className="text-[#FF6A00]">BAZAR</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
              {settings.tagline} India's trusted marketplace for 32-point certified pre-owned and refurbished smartphones with 7-Day Replacement Guarantee and 6 Months Store Warranty.
            </p>

            <div className="space-y-2.5 text-xs text-slate-300 pt-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FF6A00] shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Official Business & Support Email
                  </span>
                  <a
                    href={`mailto:${settings.officialEmail}`}
                    className="font-bold text-white hover:text-[#FF6A00] transition-colors"
                  >
                    {settings.officialEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FF6A00] shrink-0 mt-0.5" />
                <span className="text-slate-400">{settings.storeAddress}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Top Smartphone Brands (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white font-display">
              Shop by Brand
            </h4>
            <ul className="grid grid-cols-2 gap-1.5 text-xs text-slate-400">
              {brands.map((b) => (
                <li key={b}>
                  <button
                    onClick={() => handleBrandClick(b)}
                    className="hover:text-[#FF6A00] transition-colors cursor-pointer text-left"
                  >
                    {b}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Customer Service & Support (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white font-display">
              Customer Hub
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => setIsOrderTrackingOpen(true)}
                  className="hover:text-[#FF6A00] transition-colors text-emerald-400 font-bold cursor-pointer"
                >
                  Track Order
                </button>
              </li>
              <li>
                <button
                  onClick={() => openAccountModal('feedback')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-orange-400 font-bold"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Customer Feedback</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsExchangeModalOpen(true)}
                  className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#FF6A00]" />
                  <span>Exchange Your Phone</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => openAccountModal('overview')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  My Account & Wishlist
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('contact-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsAdminViewOpen(true)}
                  className="hover:text-[#FF6A00] transition-colors text-slate-500 cursor-pointer pt-2 block"
                >
                  Store Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Policies (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white font-display">
              Policies & Assurance
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => setActivePolicy('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About Phone Bazar
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy('replacement')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Return & Refund Policy (7-Day Replacement)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy('exchange')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Exchange Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy('shipping')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Shipping & Delivery Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy('warranty')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  6-Month Warranty Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy('privacy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePolicy('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms & Conditions
                </button>
              </li>
            </ul>

            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 mt-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>100% Secure Shopping</span>
              </div>
              <p className="text-[11px] text-slate-400">
                256-bit SSL encrypted checkout. Direct UPI, Cards, NetBanking & Cash on Delivery supported.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} PHONE BAZAR ({settings.officialEmail}). All rights reserved.
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-semibold">
            <span>UPI</span>
            <span>·</span>
            <span>RuPay</span>
            <span>·</span>
            <span>Visa / MasterCard</span>
            <span>·</span>
            <span>NetBanking</span>
            <span>·</span>
            <span>Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
