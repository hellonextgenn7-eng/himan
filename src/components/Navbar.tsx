import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShoppingBag,
  Heart,
  Search,
  ShieldCheck,
  Menu,
  X,
  Smartphone,
  User,
  ArrowRightLeft,
  Scale,
  Sparkles
} from 'lucide-react';
import { matchesSearchQuery } from '../utils/search';
import { handleImageError } from '../utils/imageFallback';

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  onNavigateSection
}) => {
  const {
    products,
    cartCount,
    wishlist,
    compareList,
    setIsCompareModalOpen,
    setIsCartOpen,
    setIsOrderTrackingOpen,
    setIsExchangeModalOpen,
    setIsAdminViewOpen,
    openAccountModal,
    openProductPage,
    customerAccount,
    activeExchange,
    settings
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHeaderSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    if (!headerSearch.trim()) return [];
    return products.filter((p) => matchesSearchQuery(p, headerSearch)).slice(0, 6);
  }, [products, headerSearch]);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (onNavigateSection) {
      onNavigateSection(id);
    }
  };

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearchChange?.(headerSearch);
    if (onSearchSubmit) {
      onSearchSubmit(headerSearch);
    } else {
      scrollTo('smartphones-catalog');
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      {settings.announcementActive && (
        <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 border-b border-slate-800 text-center flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#FF6A00]" />
          <p className="font-medium truncate max-w-4xl">{settings.announcementText}</p>
        </div>
      )}

      {/* Main Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-3 lg:gap-5">
          {/* 1. Brand Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                scrollTo('top');
              }}
              className="group flex items-center gap-2.5 whitespace-nowrap"
            >
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-11-13_at_5.05.27_PM_f2187aef.jpeg"
                alt="Phone Bazar Official Logo"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0 group-hover:scale-105 transition-transform"
              />
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-950 font-display">
                PHONE <span className="text-[#FF6A00]">BAZAR</span>
              </span>
            </a>
          </div>

          {/* 2. Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-5 text-xs font-extrabold text-slate-700">
            <button
              onClick={() => scrollTo('top')}
              className="hover:text-[#FF6A00] transition-colors whitespace-nowrap cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => scrollTo('smartphones-catalog')}
              className="hover:text-[#FF6A00] transition-colors whitespace-nowrap cursor-pointer"
            >
              All Smartphones
            </button>
            <button
              onClick={() => scrollTo('brands-section')}
              className="hover:text-[#FF6A00] transition-colors whitespace-nowrap cursor-pointer"
            >
              Shop by Brand
            </button>
            <button
              onClick={() => scrollTo('best-deals')}
              className="hover:text-[#FF6A00] transition-colors whitespace-nowrap cursor-pointer"
            >
              Deals
            </button>
            <button
              onClick={() => setIsOrderTrackingOpen(true)}
              className="hover:text-[#FF6A00] transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Track Order</span>
            </button>
          </nav>

          {/* 4. Action Icons: Compare, Account, Wishlist, Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Compare Button */}
            {compareList.length > 0 && (
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(true)}
                className="relative p-2.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Compare Smartphones"
                aria-label="Compare"
              >
                <Scale className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF6A00] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {compareList.length}
                </span>
              </button>
            )}

            {/* Account Icon (Desktop/Tablet - Mobile uses Bottom Nav) */}
            <button
              type="button"
              onClick={() => openAccountModal('overview')}
              className="hidden md:flex p-2.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer items-center gap-1.5"
              title={customerAccount ? `Account (${customerAccount.fullName})` : 'Login / My Account'}
              aria-label="Account"
            >
              <User className="w-5 h-5" />
              {customerAccount && (
                <span className="hidden sm:inline text-xs font-extrabold text-slate-900 max-w-[90px] truncate">
                  {customerAccount.fullName.split(' ')[0]}
                </span>
              )}
            </button>

            {/* Wishlist Icon */}
            <button
              type="button"
              onClick={() => openAccountModal('wishlist')}
              className="relative p-2.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Saved Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Button (Desktop/Tablet - Mobile uses Bottom Nav) */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="hidden md:flex items-center gap-2 px-3.5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#FF6A00]" />
              <span className="hidden sm:inline">Cart</span>
              <span className="w-5 h-5 rounded-full bg-[#FF6A00] text-white text-xs font-bold flex items-center justify-center tabular-nums">
                {cartCount}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-950 rounded-lg xl:hidden cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-xl">
            {/* Mobile Search Input */}
            <form onSubmit={handleHeaderSearchSubmit} className="relative md:hidden">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => {
                  setHeaderSearch(e.target.value);
                  onSearchChange?.(e.target.value);
                }}
                placeholder="Search smartphones, brand, storage..."
                className="w-full pl-9 pr-16 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-[#FF6A00] text-white text-xs font-bold"
              >
                Search
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => scrollTo('top')}
                className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-extrabold text-slate-900"
              >
                Home
              </button>
              <button
                onClick={() => scrollTo('smartphones-catalog')}
                className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-extrabold text-slate-900"
              >
                All Smartphones
              </button>
              <button
                onClick={() => scrollTo('brands-section')}
                className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-extrabold text-slate-900"
              >
                Shop by Brand
              </button>
              <button
                onClick={() => scrollTo('best-deals')}
                className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-extrabold text-[#FF6A00]"
              >
                Best Deals
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsOrderTrackingOpen(true);
                }}
                className="text-left p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-xs font-extrabold text-emerald-800"
              >
                Track Order
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAccountModal('overview');
                }}
                className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-extrabold text-slate-900"
              >
                My Account & Orders
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAccountModal('feedback');
                }}
                className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-extrabold text-slate-900"
              >
                Feedback & Support
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Support: {settings.officialEmail}</span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAdminViewOpen(true);
                }}
                className="text-[#FF6A00] font-bold"
              >
                Manager Portal
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
