import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Flame,
  ChevronLeft,
  ChevronRight,
  Layers,
  X,
  Scale,
  Filter
} from 'lucide-react';
import { matchesSearchQuery } from '../utils/search';

interface ProductGridProps {
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onClearSearch?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  selectedBrand,
  onSelectBrand,
  searchQuery = '',
  onSearchChange,
  onClearSearch
}) => {
  const { products, compareList, setIsCompareModalOpen, clearCompare } = useStore();

  // 10-Point Filter States
  // 1. Brand is passed via selectedBrand / onSelectBrand
  // 2. Price Range
  const [selectedPriceBracket, setSelectedPriceBracket] = useState<string>('all');
  // 3. Storage
  const [selectedStorage, setSelectedStorage] = useState<string>('all');
  // 4. RAM
  const [selectedRam, setSelectedRam] = useState<string>('all');
  // 5. Battery Health
  const [selectedBatteryHealth, setSelectedBatteryHealth] = useState<string>('all');
  // 6. Device Condition
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  // 7. Screen Size
  const [selectedScreenSize, setSelectedScreenSize] = useState<string>('all');
  // 8. Processor
  const [selectedProcessor, setSelectedProcessor] = useState<string>('all');
  // 9. Operating System
  const [selectedOs, setSelectedOs] = useState<string>('all');
  // 10. Availability
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');

  // Sort & View States
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [activeTab, setActiveTab] = useState<'all' | 'deals' | 'latest'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'paginated' | 'all'>('paginated');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const itemsPerPage = 24;

  // Reset to page 1 when search query or any of the 10 filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedBrand,
    selectedPriceBracket,
    selectedStorage,
    selectedRam,
    selectedBatteryHealth,
    selectedCondition,
    selectedScreenSize,
    selectedProcessor,
    selectedOs,
    selectedAvailability,
    searchQuery,
    activeTab,
    sortBy
  ]);

  // Filter products across all 10 criteria + search query + collection tab
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Tab filter
      if (activeTab === 'deals' && !product.isBestDeal && product.discountPercentage < 45) return false;
      if (activeTab === 'latest' && !product.isLatestArrival && Number(product.launchYear || 2022) < 2023)
        return false;

      // 1. Brand filter
      if (selectedBrand !== 'all') {
        const normSelected = selectedBrand.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normProductBrand = product.brand.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matchesBrand =
          normProductBrand === normSelected ||
          normProductBrand.includes(normSelected) ||
          normSelected.includes(normProductBrand);
        if (!matchesBrand) return false;
      }

      // 2. Price range filter
      if (selectedPriceBracket === 'under-15k' && product.sellingPrice >= 15000) return false;
      if (
        selectedPriceBracket === '15k-25k' &&
        (product.sellingPrice < 15000 || product.sellingPrice >= 25000)
      )
        return false;
      if (
        selectedPriceBracket === '25k-40k' &&
        (product.sellingPrice < 25000 || product.sellingPrice >= 40000)
      )
        return false;
      if (
        selectedPriceBracket === '40k-60k' &&
        (product.sellingPrice < 40000 || product.sellingPrice >= 60000)
      )
        return false;
      if (selectedPriceBracket === 'above-60k' && product.sellingPrice < 60000) return false;

      // 3. Storage filter (checks primary storage or any variant storage)
      if (selectedStorage !== 'all') {
        const matchesPrimary = product.storage === selectedStorage;
        const matchesVariant = product.variants?.some((v) => v.storage === selectedStorage);
        if (!matchesPrimary && !matchesVariant) return false;
      }

      // 4. RAM filter (checks primary RAM or any variant RAM)
      if (selectedRam !== 'all') {
        const matchesPrimary = product.ram === selectedRam;
        const matchesVariant = product.variants?.some((v) => v.ram === selectedRam);
        if (!matchesPrimary && !matchesVariant) return false;
      }

      // 5. Battery health filter
      if (selectedBatteryHealth !== 'all') {
        const bh = product.batteryHealth || 88;
        if (selectedBatteryHealth === '90+' && bh < 90) return false;
        if (selectedBatteryHealth === '85+' && bh < 85) return false;
        if (selectedBatteryHealth === '80+' && bh < 80) return false;
      }

      // 6. Device condition filter
      if (selectedCondition !== 'all' && product.condition !== selectedCondition) {
        return false;
      }

      // 7. Screen size filter
      if (selectedScreenSize !== 'all') {
        const sizeMatch = (product.specs?.screenSize || product.specs?.display || '').match(/(\d+\.\d+)/);
        const inches = sizeMatch ? parseFloat(sizeMatch[1]) : 6.5;
        if (selectedScreenSize === 'compact' && inches >= 6.3) return false;
        if (selectedScreenSize === 'standard' && (inches < 6.3 || inches > 6.65)) return false;
        if (selectedScreenSize === 'large' && inches <= 6.65) return false;
      }

      // 8. Processor filter
      if (selectedProcessor !== 'all') {
        const proc = (product.specs?.processor || '').toLowerCase();
        if (!proc.includes(selectedProcessor.toLowerCase())) return false;
      }

      // 9. Operating system filter
      if (selectedOs !== 'all') {
        const os = (product.specs?.os || '').toLowerCase();
        if (selectedOs === 'iOS' && !os.includes('ios')) return false;
        if (selectedOs === 'Android' && !os.includes('android')) return false;
      }

      // 10. Availability filter
      if (selectedAvailability === 'in-stock' && product.stock <= 0) return false;

      // Search query
      if (searchQuery && searchQuery.trim()) {
        if (!matchesSearchQuery(product, searchQuery)) return false;
      }

      return true;
    });
  }, [
    products,
    selectedBrand,
    selectedPriceBracket,
    selectedStorage,
    selectedRam,
    selectedBatteryHealth,
    selectedCondition,
    selectedScreenSize,
    selectedProcessor,
    selectedOs,
    selectedAvailability,
    searchQuery,
    activeTab
  ]);

  // Sort products across all 5 required sort options
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => a.sellingPrice - b.sellingPrice);
      case 'price-desc':
        return list.sort((a, b) => b.sellingPrice - a.sellingPrice);
      case 'newest':
        return list.sort((a, b) => Number(b.launchYear || 2020) - Number(a.launchYear || 2020));
      case 'discount-desc':
        return list.sort((a, b) => b.discountPercentage - a.discountPercentage);
      case 'popularity':
      default:
        return list.sort((a, b) => b.reviewCount * b.rating - a.reviewCount * a.rating);
    }
  }, [filteredProducts, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / itemsPerPage));

  const paginatedProducts = useMemo(() => {
    if (viewMode === 'all') return sortedProducts;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage, viewMode]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const el = document.getElementById('smartphones-catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeFilterCount = [
    selectedBrand !== 'all',
    selectedPriceBracket !== 'all',
    selectedStorage !== 'all',
    selectedRam !== 'all',
    selectedBatteryHealth !== 'all',
    selectedCondition !== 'all',
    selectedScreenSize !== 'all',
    selectedProcessor !== 'all',
    selectedOs !== 'all',
    selectedAvailability !== 'all',
    Boolean(searchQuery && searchQuery.trim())
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    onSelectBrand('all');
    setSelectedPriceBracket('all');
    setSelectedStorage('all');
    setSelectedRam('all');
    setSelectedBatteryHealth('all');
    setSelectedCondition('all');
    setSelectedScreenSize('all');
    setSelectedProcessor('all');
    setSelectedOs('all');
    setSelectedAvailability('all');
    onClearSearch?.();
    setActiveTab('all');
    setSortBy('popularity');
    setCurrentPage(1);
  };

  const getPageNumbers = (current: number, total: number): (number | string)[] => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const brandOptions = [
    { id: 'all', label: 'All Brands' },
    { id: 'Apple', label: 'Apple iPhone' },
    { id: 'Samsung', label: 'Samsung Galaxy' },
    { id: 'OnePlus', label: 'OnePlus' },
    { id: 'Google', label: 'Google Pixel' },
    { id: 'Xiaomi', label: 'Xiaomi' },
    { id: 'Redmi', label: 'Redmi' },
    { id: 'Realme', label: 'Realme' },
    { id: 'Vivo', label: 'Vivo' },
    { id: 'OPPO', label: 'OPPO' },
    { id: 'Motorola', label: 'Motorola' },
    { id: 'POCO', label: 'POCO' },
    { id: 'iQOO', label: 'iQOO' }
  ];

  // Shared 10-Point Filter Panel UI (used in Desktop Sidebar & Mobile Drawer)
  const renderTenPointFilters = () => (
    <div className="space-y-5 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-sm text-slate-950">
          <Filter className="w-4 h-4 text-[#FF6A00]" />
          <span>10-Point Smart Filters</span>
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-extrabold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Clear All ({activeFilterCount})
          </button>
        )}
      </div>

      {/* 1. Brand */}
      <div className="space-y-1.5">
        <label className="block font-extrabold uppercase tracking-wider text-slate-600">1. Brand</label>
        <select
          value={selectedBrand}
          onChange={(e) => onSelectBrand(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-800 cursor-pointer"
        >
          {brandOptions.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Price Range */}
      <div className="space-y-1.5">
        <label className="block font-extrabold uppercase tracking-wider text-slate-600">
          2. Price Range
        </label>
        <select
          value={selectedPriceBracket}
          onChange={(e) => setSelectedPriceBracket(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-800 cursor-pointer"
        >
          <option value="all">All Price Ranges</option>
          <option value="under-15k">Under ₹15,000</option>
          <option value="15k-25k">₹15,000 – ₹25,000</option>
          <option value="25k-40k">₹25,000 – ₹40,000</option>
          <option value="40k-60k">₹40,000 – ₹60,000</option>
          <option value="above-60k">Above ₹60,000</option>
        </select>
      </div>

      {/* 3. Internal Storage */}
      <div className="space-y-1.5">
        <label className="block font-extrabold uppercase tracking-wider text-slate-600">
          3. Internal Storage
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {['all', '64GB', '128GB', '256GB', '512GB'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStorage(st)}
              className={`py-2 px-2 rounded-lg font-bold border transition-all cursor-pointer ${
                selectedStorage === st
                  ? 'bg-slate-950 text-white border-slate-950'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
              }`}
            >
              {st === 'all' ? 'All' : st}
            </button>
          ))}
        </div>
      </div>

      {/* 4. RAM */}
      <div className="space-y-1.5">
        <label className="block font-extrabold uppercase tracking-wider text-slate-600">4. RAM</label>
        <div className="grid grid-cols-3 gap-1.5">
          {['all', '4GB', '6GB', '8GB', '12GB'].map((ram) => (
            <button
              key={ram}
              type="button"
              onClick={() => setSelectedRam(ram)}
              className={`py-2 px-2 rounded-lg font-bold border transition-all cursor-pointer ${
                selectedRam === ram
                  ? 'bg-slate-950 text-white border-slate-950'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
              }`}
            >
              {ram === 'all' ? 'All' : ram}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Battery Health */}
      <div className="space-y-1.5">
        <label className="block font-extrabold uppercase tracking-wider text-slate-600">
          5. Battery Health
        </label>
        <select
          value={selectedBatteryHealth}
          onChange={(e) => setSelectedBatteryHealth(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-800 cursor-pointer"
        >
          <option value="all">Any Certified Battery Health</option>
          <option value="90+">90% & Above (Peak Health)</option>
          <option value="85+">85% & Above (Guaranteed)</option>
          <option value="80+">80% & Above (Standard)</option>
        </select>
      </div>

      {/* 6. Device Condition */}
      <div className="space-y-1.5">
        <label className="block font-extrabold uppercase tracking-wider text-slate-600">
          6. Device Condition
        </label>
        <select
          value={selectedCondition}
          onChange={(e) => setSelectedCondition(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-800 cursor-pointer"
        >
          <option value="all">All Certified Grades</option>
          <option value="Like New">Like New (Flawless)</option>
          <option value="Excellent">Excellent (Pristine Screen)</option>
          <option value="Very Good">Very Good</option>
          <option value="Good">Good (Value Choice)</option>
          <option value="Fair">Fair</option>
        </select>
      </div>

      {/* 7. Screen Size */}
      <div className="space-y-1.5">
        <label className="block font-extrabold uppercase tracking-wider text-slate-600">
          7. Screen Size
        </label>
        <select
          value={selectedScreenSize}
          onChange={(e) => setSelectedScreenSize(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-800 cursor-pointer"
        >
          <option value="all">All Display Sizes</option>
          <option value="compact">Compact (Under 6.3 inches)</option>
          <option value="standard">Standard (6.3" – 6.65")</option>
          <option value="large">Large Max / Ultra (Above 6.65")</option>
        </select>
      </div>

      {/* 8. Processor */}
      <div className="space-y-1.5">
        <label className="block font-extrabold uppercase tracking-wider text-slate-600">
          8. Processor Family
        </label>
        <select
          value={selectedProcessor}
          onChange={(e) => setSelectedProcessor(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-800 cursor-pointer"
        >
          <option value="all">All Processors</option>
          <option value="Apple">Apple A-Series Bionic / Pro</option>
          <option value="Snapdragon">Qualcomm Snapdragon</option>
          <option value="Dimensity">MediaTek Dimensity / Helio</option>
          <option value="Exynos">Samsung Exynos</option>
          <option value="Tensor">Google Tensor</option>
        </select>
      </div>

      {/* 9. Operating System */}
      <div className="space-y-1.5">
        <label className="block font-extrabold uppercase tracking-wider text-slate-600">
          9. Operating System
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {['all', 'iOS', 'Android'].map((os) => (
            <button
              key={os}
              type="button"
              onClick={() => setSelectedOs(os)}
              className={`py-2 px-2 rounded-lg font-bold border transition-all cursor-pointer ${
                selectedOs === os
                  ? 'bg-slate-950 text-white border-slate-950'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
              }`}
            >
              {os === 'all' ? 'All OS' : os}
            </button>
          ))}
        </div>
      </div>

      {/* 10. Availability */}
      <div className="space-y-1.5">
        <label className="block font-extrabold uppercase tracking-wider text-slate-600">
          10. Availability
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'all', label: 'All Listings' },
            { id: 'in-stock', label: 'In Stock Only' }
          ].map((av) => (
            <button
              key={av.id}
              type="button"
              onClick={() => setSelectedAvailability(av.id)}
              className={`py-2 px-2 rounded-lg font-bold border transition-all cursor-pointer ${
                selectedAvailability === av.id
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
              }`}
            >
              {av.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section id="smartphones-catalog" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#FF6A00]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">
                Certified Pre-Owned Inventory
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display tracking-tight">
              {searchQuery ? `Search Results: "${searchQuery}"` : 'Explore All Certified Smartphones'}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Showing <span className="font-bold text-slate-900">{sortedProducts.length}</span> verified
              devices ready for express dispatch across India
            </p>
          </div>

          {/* Quick Collection Segmented Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              All Smartphones
            </button>
            <button
              onClick={() => setActiveTab('deals')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'deals' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#FF6A00]" />
              Best Deals
            </button>
            <button
              onClick={() => setActiveTab('latest')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'latest' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Latest Arrivals
            </button>
          </div>
        </div>

        {/* Integrated Catalog Search Bar + Sort Dropdown + Mobile Filter Button */}
        <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Catalog Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search catalog by model, brand, RAM (e.g. 8GB), storage (256GB), processor, or budget (under 20000)..."
              className="w-full pl-10 pr-20 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#FF6A00]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={onClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Mobile Filter Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex-1 sm:flex-initial px-4 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#FF6A00]" />
              <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
            </button>

            {/* Compare Trigger if items selected */}
            {compareList.length > 0 && (
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(true)}
                className="px-3.5 py-2.5 bg-[#FF6A00] hover:bg-orange-600 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Scale className="w-4 h-4" />
                <span>Compare ({compareList.length}/3)</span>
              </button>
            )}

            {/* 5-Option Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2.5 px-3.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#FF6A00] cursor-pointer"
              aria-label="Sort smartphones"
            >
              <option value="popularity">Sort: Popularity</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="discount-desc">Best Discount</option>
            </select>
          </div>
        </div>

        {/* Main 2-Column Layout: 10-Point Filter Sidebar (Left) + Product Grid (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Desktop 10-Point Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 p-5 rounded-3xl border border-slate-200 bg-slate-50/70 sticky top-24">
            {renderTenPointFilters()}
          </aside>

          {/* Product Listing Column */}
          <div className="lg:col-span-9">
            {sortedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls Bar */}
                <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-xs sm:text-sm text-slate-600 font-medium text-center md:text-left">
                    Showing{' '}
                    <strong className="text-slate-900 font-extrabold">
                      {viewMode === 'all'
                        ? sortedProducts.length
                        : `${(currentPage - 1) * itemsPerPage + 1} – ${Math.min(
                            currentPage * itemsPerPage,
                            sortedProducts.length
                          )}`}
                    </strong>{' '}
                    of <strong className="text-slate-900 font-extrabold">{sortedProducts.length}</strong>{' '}
                    smartphones
                  </div>

                  {viewMode === 'paginated' && totalPages > 1 && (
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
                      <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Prev</span>
                      </button>

                      {getPageNumbers(currentPage, totalPages).map((p, idx) => {
                        if (p === '...') {
                          return (
                            <span key={`dots-${idx}`} className="px-2 text-slate-400 font-bold text-xs">
                              ...
                            </span>
                          );
                        }
                        const pageNum = Number(p);
                        const isActive = pageNum === currentPage;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                              isActive
                                ? 'bg-[#FF6A00] text-white shadow-md font-extrabold'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const nextMode = viewMode === 'paginated' ? 'all' : 'paginated';
                      setViewMode(nextMode);
                      if (nextMode === 'all') setCurrentPage(1);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>
                      {viewMode === 'paginated'
                        ? `View All (${sortedProducts.length})`
                        : 'Show Paginated (24 / page)'}
                    </span>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-16 px-4 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 text-[#FF6A00] flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No Smartphones Match Your Filter</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                  Try clearing one or more filters or searching for another smartphone model or brand.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-end lg:hidden">
          <div className="bg-white w-full max-w-sm h-full p-5 overflow-y-auto flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-base font-extrabold text-slate-950">Filter Smartphones</span>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderTenPointFilters()}
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-xs font-extrabold text-slate-700"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 rounded-xl bg-[#FF6A00] text-white text-xs font-extrabold"
              >
                Show {sortedProducts.length} Phones
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
