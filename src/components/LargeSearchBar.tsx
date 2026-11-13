import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Search,
  X,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Flame,
  CheckCircle2,
  Tag,
  Star
} from 'lucide-react';
import { Product } from '../types';
import { matchesSearchQuery } from '../utils/search';
import { handleImageError } from '../utils/imageFallback';

interface LargeSearchBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  className?: string;
}

export const LargeSearchBar: React.FC<LargeSearchBarProps> = ({
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
  className = ''
}) => {
  const { products, setSelectedProduct, addToCart } = useStore();
  const [query, setQuery] = useState(searchQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [recommendedCategory, setRecommendedCategory] = useState<'all' | 'under20k' | 'apple' | 'samsung' | 'deals'>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal state if external prop changes
  useEffect(() => {
    if (searchQuery !== undefined && searchQuery !== query) {
      setQuery(searchQuery);
    }
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter matching products when query is active using centralized matchesSearchQuery
  // Handles brand aliases like "moto" matching all 72 Motorola phones, "galaxy" matching Samsung, etc.
  const matchingProducts = useMemo(() => {
    if (!query.trim()) return [];
    return products.filter((p) => matchesSearchQuery(p, query));
  }, [products, query]);

  // Curated recommended phones when user focuses without typing or filter tabs
  const recommendedPhones = useMemo(() => {
    if (recommendedCategory === 'under20k') {
      return products.filter((p) => p.sellingPrice <= 20000).slice(0, 8);
    }
    if (recommendedCategory === 'apple') {
      return products.filter((p) => p.brand.toLowerCase().includes('apple')).slice(0, 8);
    }
    if (recommendedCategory === 'samsung') {
      return products.filter((p) => p.brand.toLowerCase().includes('samsung')).slice(0, 8);
    }
    if (recommendedCategory === 'deals') {
      return products.filter((p) => p.discountPercentage >= 55).slice(0, 8);
    }
    // 'all' recommended: mix of top flagship and high-value devices
    return products.filter((p) => p.isFeatured || p.isBestDeal || p.discountPercentage >= 50).slice(0, 8);
  }, [products, recommendedCategory]);

  const displayedPhones = query.trim() ? matchingProducts.slice(0, 12) : recommendedPhones;

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsOpen(false);
  };

  const handleInputChange = (val: string) => {
    setQuery(val);
    setIsOpen(true);
    onSearchChange?.(val);
  };

  const handleQuickTag = (tag: string) => {
    if (tag === 'Under ₹20,000') {
      setQuery('');
      setRecommendedCategory('under20k');
      setIsOpen(true);
      return;
    }
    if (tag === 'Best Deals') {
      setQuery('');
      setRecommendedCategory('deals');
      setIsOpen(true);
      return;
    }
    setQuery(tag);
    setIsOpen(true);
    onSearchChange?.(tag);
    onSearchSubmit?.(tag);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(query);
    }
    const catalogEl = document.getElementById('smartphones-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-5xl mx-auto ${className}`}>
      
      {/* Sleek Compact Search Bar Container */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center bg-white rounded-full sm:rounded-2xl border-2 border-slate-300 hover:border-slate-400 focus-within:border-[#FF6A00] focus-within:ring-4 focus-within:ring-orange-500/20 shadow-xl transition-all duration-300 p-1 sm:p-1.5"
      >
        {/* Left Search Icon */}
        <div className="pl-2.5 pr-2 text-slate-400 flex items-center justify-center shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center">
            <Search className="w-4 h-4 text-[#FF6A00]" />
          </div>
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Search 660+ phones (e.g. Moto, iPhone 13, Galaxy S23, Under ₹20,000)..."
          className="w-full h-9 sm:h-10 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none px-1.5"
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={() => handleInputChange('')}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors shrink-0 mr-1"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Action Button */}
        <button
          type="submit"
          className="px-4 sm:px-6 h-9 sm:h-10 bg-slate-950 hover:bg-[#FF6A00] text-white font-bold text-xs sm:text-sm rounded-full sm:rounded-xl transition-all shrink-0 flex items-center gap-1.5 shadow-md hover:shadow-orange-500/30 cursor-pointer"
        >
          <span>Search</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </form>

      {/* Popular Trending Quick Tags */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2.5 text-[11px]">
        <span className="flex items-center gap-1 font-bold text-slate-300">
          <TrendingUp className="w-3 h-3 text-[#FF6A00]" /> Popular:
        </span>
        {[
          { label: '📱 Moto / Motorola', query: 'Moto' },
          { label: '🔥 iPhone 13', query: 'iPhone 13' },
          { label: '⚡ Galaxy S23', query: 'Galaxy S23' },
          { label: '💰 Under ₹20,000', query: 'Under ₹20,000' },
          { label: '⭐ OnePlus 12', query: 'OnePlus 12' },
          { label: '🏷️ Best Deals', query: 'Best Deals' },
          { label: '📸 Pixel 7', query: 'Pixel 7' }
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleQuickTag(item.query)}
            className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 hover:border-orange-500/50 transition-all font-medium cursor-pointer shadow-xs text-[11px]"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* EXPANDED BIG VISUAL RECOMMENDATION & SEARCH PANEL */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          
          {/* Header Bar */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                {query.trim() ? (
                  <Search className="w-4 h-4 text-[#FF6A00]" />
                ) : (
                  <Flame className="w-4 h-4 text-[#FF6A00]" />
                )}
                <h3 className="text-sm sm:text-base font-extrabold text-white font-display">
                  {query.trim()
                    ? `Matching Smartphones (${matchingProducts.length} Found)`
                    : '🔥 Recommended Smartphones For You'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF6A00] text-white font-bold">
                  Verified In Stock
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {query.trim()
                  ? `Showing top models matching "${query}". Click any phone to inspect specs.`
                  : 'Handpicked certified pre-owned smartphones ready for express dispatch across India.'}
              </p>
            </div>

            {/* Quick Category Switcher Tabs when in recommendation mode */}
            {!query.trim() && (
              <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
                {[
                  { id: 'all', label: 'All Featured' },
                  { id: 'under20k', label: 'Under ₹20k' },
                  { id: 'apple', label: 'Apple' },
                  { id: 'samsung', label: 'Samsung' },
                  { id: 'deals', label: 'Top Deals' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setRecommendedCategory(tab.id as any)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      recommendedCategory === tab.id
                        ? 'bg-[#FF6A00] text-white shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* BIG VISUAL PHONE CARDS GRID (Showing large images of recommended phones) */}
          {displayedPhones.length > 0 ? (
            <div className="p-4 sm:p-6 bg-slate-50/70 max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                {displayedPhones.map((phone) => (
                  <div
                    key={phone.id}
                    onClick={() => handleSelectProduct(phone)}
                    className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#FF6A00] hover:shadow-xl transition-all duration-300 p-3 sm:p-4 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1 relative"
                  >
                    {/* Top Badges */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#FF6A00] text-white">
                        {phone.discountPercentage}% OFF
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {phone.condition}
                      </span>
                    </div>

                    {/* LARGE UNCLIPPED SMARTPHONE PRODUCT IMAGE VIEWPORT */}
                    <div className="relative w-full h-32 sm:h-36 bg-gradient-to-b from-slate-50 to-slate-100/80 rounded-xl p-2.5 mb-2.5 flex items-center justify-center overflow-hidden border border-slate-100">
                      <img
                        src={phone.images[0]}
                        alt={phone.name}
                        referrerPolicy="no-referrer"
                        onError={handleImageError}
                        className="max-h-full max-w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)] group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    {/* Phone Info */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="uppercase font-bold tracking-wider">{phone.brand}</span>
                        {phone.launchYear && (
                          <span className="font-semibold text-slate-400">({phone.launchYear})</span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#FF6A00] transition-colors truncate font-display">
                        {phone.name}
                      </h4>

                      <p className="text-[11px] text-slate-500">
                        {phone.ram === 'Variant Dependent' ? 'Multi-Variant' : `${phone.ram} · ${phone.storage}`}
                      </p>

                      {/* Pricing */}
                      <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                        <div>
                          <div className="text-sm sm:text-base font-extrabold text-slate-950 font-display tabular-nums">
                            ₹{phone.sellingPrice.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-400 line-through tabular-nums">
                            ₹{phone.originalPrice.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(phone, 1);
                            setIsOpen(false);
                          }}
                          className="p-2 bg-slate-100 hover:bg-[#FF6A00] text-slate-700 hover:text-white rounded-xl transition-colors cursor-pointer"
                          title="Add to Cart"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {query.trim() && matchingProducts.length > displayedPhones.length && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                  <span className="text-slate-700 font-medium text-center sm:text-left">
                    Found <strong className="text-[#FF6A00] font-bold">{matchingProducts.length} smartphones</strong> matching "{query}". Showing top {displayedPhones.length} previews.
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    className="px-3.5 py-1.5 bg-[#FF6A00] hover:bg-[#E55F00] text-white font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    View All {matchingProducts.length} Phones in Catalog →
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="p-8 text-center bg-slate-50">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF6A00] flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                No smartphones found matching "{query}"
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try searching with another model name like "iPhone 13", "Galaxy S22", or "F17 Pro".
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="px-4 py-2 bg-slate-900 hover:bg-[#FF6A00] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  View Recommended Phones
                </button>
              </div>
            </div>
          )}

          {/* Footer Bar: Link to Full Catalog */}
          <div className="p-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              ⚡ Over <strong className="text-slate-900">660+ smartphones</strong> tested with 7-Day Replacement Guarantee
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              className="font-bold text-[#FF6A00] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all {matchingProducts.length > 0 ? matchingProducts.length : '660+'} results in catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
