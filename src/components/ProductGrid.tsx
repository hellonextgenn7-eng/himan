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
  Check,
  ArrowUpDown
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
  onClearSearch
}) => {
  const { products, compareList, setIsCompareModalOpen } = useStore();

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
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const itemsPerPage = 24;

  // Prevent background scrolling when filter drawer/sheet is open
  useEffect(() => {
    if (isFilterDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFilterDrawerOpen]);

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

  const priceBracketLabels: Record<string, string> = {
    'under-15k': 'Under ₹15,000',
    '15k-25k': '₹15,000 – ₹25,000',
    '25k-40k': '₹25,000 – ₹40,000',
    '40k-60k': '₹40,000 – ₹60,000',
    'above-60k': 'Above ₹60,000'
  };

  const screenSizeLabels: Record<string, string> = {
    compact: 'Compact (<6.3")',
    standard: 'Standard (6.3"–6.65")',
    large: 'Large (>6.65")'
  };

  // Active filter descriptors for badge count and removable chips
  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    if (searchQuery && searchQuery.trim()) {
      chips.push({
        key: 'search',
        label: `Search: "${searchQuery.trim()}"`,
        onRemove: () => onClearSearch?.()
      });
    }
    if (selectedBrand !== 'all') {
      chips.push({
        key: 'brand',
        label: `Brand: ${selectedBrand}`,
        onRemove: () => onSelectBrand('all')
      });
    }
    if (selectedPriceBracket !== 'all') {
      chips.push({
        key: 'price',
        label: `Price: ${priceBracketLabels[selectedPriceBracket] || selectedPriceBracket}`,
        onRemove: () => setSelectedPriceBracket('all')
      });
    }
    if (selectedCondition !== 'all') {
      chips.push({
        key: 'condition',
        label: `Condition: ${selectedCondition}`,
        onRemove: () => setSelectedCondition('all')
      });
    }
    if (selectedStorage !== 'all') {
      chips.push({
        key: 'storage',
        label: `Storage: ${selectedStorage}`,
        onRemove: () => setSelectedStorage('all')
      });
    }
    if (selectedRam !== 'all') {
      chips.push({
        key: 'ram',
        label: `RAM: ${selectedRam}`,
        onRemove: () => setSelectedRam('all')
      });
    }
    if (selectedBatteryHealth !== 'all') {
      chips.push({
        key: 'battery',
        label: `Battery: ${selectedBatteryHealth}%`,
        onRemove: () => setSelectedBatteryHealth('all')
      });
    }
    if (selectedOs !== 'all') {
      chips.push({
        key: 'os',
        label: `OS: ${selectedOs}`,
        onRemove: () => setSelectedOs('all')
      });
    }
    if (selectedProcessor !== 'all') {
      chips.push({
        key: 'processor',
        label: `Chip: ${selectedProcessor}`,
        onRemove: () => setSelectedProcessor('all')
      });
    }
    if (selectedScreenSize !== 'all') {
      chips.push({
        key: 'screen',
        label: `Display: ${screenSizeLabels[selectedScreenSize] || selectedScreenSize}`,
        onRemove: () => setSelectedScreenSize('all')
      });
    }
    if (selectedAvailability !== 'all') {
      chips.push({
        key: 'availability',
        label: 'In Stock Only',
        onRemove: () => setSelectedAvailability('all')
      });
    }

    return chips;
  }, [
    searchQuery,
    selectedBrand,
    selectedPriceBracket,
    selectedCondition,
    selectedStorage,
    selectedRam,
    selectedBatteryHealth,
    selectedOs,
    selectedProcessor,
    selectedScreenSize,
    selectedAvailability,
    onClearSearch,
    onSelectBrand
  ]);

  const activeFilterCount = activeFilterChips.length;

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

  const priceOptions = [
    { id: 'all', label: 'All Prices' },
    { id: 'under-15k', label: 'Under ₹15,000' },
    { id: '15k-25k', label: '₹15,000 – ₹25,000' },
    { id: '25k-40k', label: '₹25,000 – ₹40,000' },
    { id: '40k-60k', label: '₹40,000 – ₹60,000' },
    { id: 'above-60k', label: 'Above ₹60,000' }
  ];

  const conditionOptions = [
    { id: 'all', label: 'All Certified Grades' },
    { id: 'Like New', label: 'Like New (Flawless)' },
    { id: 'Excellent', label: 'Excellent (Pristine)' },
    { id: 'Very Good', label: 'Very Good' },
    { id: 'Good', label: 'Good (Value Choice)' },
    { id: 'Fair', label: 'Fair' }
  ];

  return (
    <section id="smartphones-catalog" className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Clean Catalog Header + Minimal Filter & Sort Toolbar */}
        <div className="flex flex-col gap-4 pb-5 border-b border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#FF6A00]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">
                  Certified Pre-Owned Inventory
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-display tracking-tight">
                {searchQuery ? `Search Results: "${searchQuery}"` : 'Explore Available Smartphones'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Showing <span className="font-bold text-slate-900 tabular-nums">{sortedProducts.length}</span>{' '}
                verified devices ready for express dispatch
              </p>
            </div>

            {/* Compact Toolbar: Collection Tabs + Filter Button + Sort Dropdown */}
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5">
              {/* Quick Collection Segmented Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto max-w-full">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 sm:px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'all'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  All Smartphones
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('deals')}
                  className={`px-3 sm:px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === 'deals'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-[#FF6A00]" />
                  <span>Best Deals</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('latest')}
                  className={`px-3 sm:px-3.5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === 'latest'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Latest Arrivals</span>
                </button>
              </div>

              {/* Action Controls: Compact Filter Button + Compare + Sort Dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Compact Filter Trigger (Mobile Bottom Sheet / Desktop Slide Drawer) */}
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    activeFilterCount > 0
                      ? 'bg-slate-950 text-white border-slate-950 shadow-sm hover:bg-slate-900'
                      : 'bg-slate-950 text-white border-slate-950 hover:bg-slate-800 shadow-xs'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#FF6A00]" />
                  <span>Filter</span>
                  {activeFilterCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#FF6A00] text-white text-[10px] font-black leading-none tabular-nums">
                      {activeFilterCount}
                    </span>
                  )}
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

                {/* Compact Sort Selector */}
                <div className="relative flex-1 sm:flex-initial">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full py-2.5 pl-8 pr-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#FF6A00] cursor-pointer transition-colors"
                    aria-label="Sort smartphones"
                  >
                    <option value="popularity">Sort: Recommended</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                    <option value="discount-desc">Best Discount</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Filters as Compact Removable Chips */}
          {activeFilterChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                Active Filters:
              </span>
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-[#FF6A00] transition-colors cursor-pointer group"
                >
                  <span>{chip.label}</span>
                  <X className="w-3 h-3 text-slate-400 group-hover:text-white" />
                </button>
              ))}
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold text-[#FF6A00] hover:bg-orange-50 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            </div>
          )}
        </div>

        {/* Full-Width Smartphone Product Grid */}
        <div className="pt-6">
          {sortedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Controls Bar */}
              <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-xs sm:text-sm text-slate-600 font-medium text-center md:text-left">
                  Showing{' '}
                  <strong className="text-slate-900 font-extrabold tabular-nums">
                    {viewMode === 'all'
                      ? sortedProducts.length
                      : `${(currentPage - 1) * itemsPerPage + 1} – ${Math.min(
                          currentPage * itemsPerPage,
                          sortedProducts.length
                        )}`}
                  </strong>{' '}
                  of{' '}
                  <strong className="text-slate-900 font-extrabold tabular-nums">
                    {sortedProducts.length}
                  </strong>{' '}
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
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center tabular-nums ${
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
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Responsive Filter Bottom Sheet (Mobile) & Slide-Over Drawer (Desktop) */}
      {isFilterDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-stretch sm:justify-end animate-in fade-in duration-200"
          onClick={() => setIsFilterDrawerOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full sm:max-w-md max-h-[88vh] sm:max-h-full sm:h-full rounded-t-3xl sm:rounded-none sm:rounded-l-3xl shadow-2xl border-t sm:border-t-0 sm:border-l border-slate-200 flex flex-col justify-between overflow-hidden"
          >
            {/* Sticky Drawer Header */}
            <div className="px-5 pt-3 pb-4 sm:py-4 bg-slate-950 text-white border-b border-slate-800 shrink-0">
              {/* Mobile Drag Handle Pill */}
              <div className="w-10 h-1 rounded-full bg-slate-700 mx-auto mb-3 sm:hidden" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FF6A00]/15 border border-[#FF6A00]/40 flex items-center justify-center">
                    <SlidersHorizontal className="w-4 h-4 text-[#FF6A00]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-white font-display">
                        Filter &amp; Sort Smartphones
                      </h3>
                      {activeFilterCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FF6A00] text-white text-[10px] font-black tabular-nums">
                          {activeFilterCount} Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {sortedProducts.length} verified smartphones match your selection
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Organized Filter Groups */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
              {/* Group 0: Sort By */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 space-y-2.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Sort By
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'popularity', label: 'Recommended' },
                    { id: 'price-asc', label: 'Price: Low to High' },
                    { id: 'price-desc', label: 'Price: High to Low' },
                    { id: 'newest', label: 'Newest First' },
                    { id: 'discount-desc', label: 'Highest Discount' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSortBy(opt.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition-all cursor-pointer ${
                        sortBy === opt.id
                          ? 'bg-slate-950 text-white border-slate-950'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {sortBy === opt.id && <Check className="w-3.5 h-3.5 text-[#FF6A00] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group 1: Brand & Operating System */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    1. Smartphone Brand
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => onSelectBrand(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-xs text-slate-900 focus:outline-none focus:border-[#FF6A00] cursor-pointer"
                  >
                    {brandOptions.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    2. Operating System
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['all', 'iOS', 'Android'].map((os) => (
                      <button
                        key={os}
                        type="button"
                        onClick={() => setSelectedOs(os)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedOs === os
                            ? 'bg-slate-950 text-white border-slate-950'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {os === 'all' ? 'All OS' : os}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Group 2: Price Range */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 space-y-2.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  3. Price Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {priceOptions.map((price) => (
                    <button
                      key={price.id}
                      type="button"
                      onClick={() => setSelectedPriceBracket(price.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left flex items-center justify-between ${
                        selectedPriceBracket === price.id
                          ? 'bg-[#FF6A00] text-white border-[#FF6A00]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <span className="truncate">{price.label}</span>
                      {selectedPriceBracket === price.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group 3: Condition & Battery Health */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    4. Device Condition
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {conditionOptions.map((cond) => (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => setSelectedCondition(cond.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left truncate ${
                          selectedCondition === cond.id
                            ? 'bg-slate-950 text-white border-slate-950'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {cond.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    5. Certified Battery Health
                  </label>
                  <select
                    value={selectedBatteryHealth}
                    onChange={(e) => setSelectedBatteryHealth(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-xs text-slate-900 focus:outline-none focus:border-[#FF6A00] cursor-pointer"
                  >
                    <option value="all">Any Certified Battery Health</option>
                    <option value="90+">90% &amp; Above (Peak Health)</option>
                    <option value="85+">85% &amp; Above (Guaranteed)</option>
                    <option value="80+">80% &amp; Above (Standard)</option>
                  </select>
                </div>
              </div>

              {/* Group 4: Storage & RAM */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    6. Internal Storage
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['all', '64GB', '128GB', '256GB', '512GB'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSelectedStorage(st)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedStorage === st
                            ? 'bg-slate-950 text-white border-slate-950'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {st === 'all' ? 'Any Storage' : st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    7. RAM Capacity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['all', '4GB', '6GB', '8GB', '12GB'].map((ram) => (
                      <button
                        key={ram}
                        type="button"
                        onClick={() => setSelectedRam(ram)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedRam === ram
                            ? 'bg-slate-950 text-white border-slate-950'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {ram === 'all' ? 'Any RAM' : ram}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Group 5: Display, Processor & Availability */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    8. Screen Size
                  </label>
                  <select
                    value={selectedScreenSize}
                    onChange={(e) => setSelectedScreenSize(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-xs text-slate-900 focus:outline-none focus:border-[#FF6A00] cursor-pointer"
                  >
                    <option value="all">All Display Sizes</option>
                    <option value="compact">Compact (Under 6.3 inches)</option>
                    <option value="standard">Standard (6.3&quot; – 6.65&quot;)</option>
                    <option value="large">Large Max / Ultra (Above 6.65&quot;)</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    9. Processor Family
                  </label>
                  <select
                    value={selectedProcessor}
                    onChange={(e) => setSelectedProcessor(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-xs text-slate-900 focus:outline-none focus:border-[#FF6A00] cursor-pointer"
                  >
                    <option value="all">All Processors</option>
                    <option value="Apple">Apple A-Series Bionic / Pro</option>
                    <option value="Snapdragon">Qualcomm Snapdragon</option>
                    <option value="Dimensity">MediaTek Dimensity / Helio</option>
                    <option value="Exynos">Samsung Exynos</option>
                    <option value="Tensor">Google Tensor</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    10. Stock Availability
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'all', label: 'All Listings' },
                      { id: 'in-stock', label: 'In Stock Only' }
                    ].map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setSelectedAvailability(av.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedAvailability === av.id
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {av.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Drawer Footer: Clear All + Apply Filters */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-extrabold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-3 px-5 rounded-xl bg-[#FF6A00] hover:bg-[#e55f00] text-white text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Apply Filters · Show {sortedProducts.length} Phones</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
