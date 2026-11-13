import React from 'react';
import { Home, ShoppingCart, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const MobileBottomNav: React.FC = () => {
  const {
    cartCount,
    isCartOpen,
    setIsCartOpen,
    isAccountModalOpen,
    setIsAccountModalOpen,
    openAccountModal,
    customerAccount,
    selectedProduct,
    closeProductPage,
    isCheckoutOpen,
    isOrderTrackingOpen,
    isExchangeModalOpen,
    isCompareModalOpen,
    setIsCheckoutOpen,
    setIsOrderTrackingOpen,
    setIsExchangeModalOpen,
    setIsCompareModalOpen,
    activePolicy,
    setActivePolicy
  } = useStore();

  const closeAllSecondaryOverlays = () => {
    if (isCheckoutOpen) setIsCheckoutOpen(false);
    if (isOrderTrackingOpen) setIsOrderTrackingOpen(false);
    if (isExchangeModalOpen) setIsExchangeModalOpen(false);
    if (isCompareModalOpen) setIsCompareModalOpen(false);
    if (activePolicy) setActivePolicy(null);
  };

  // Active tab resolution based on current view & drawer/modal state
  const activeTab: 'home' | 'cart' | 'account' | 'none' = isCartOpen
    ? 'cart'
    : isAccountModalOpen
    ? 'account'
    : !selectedProduct
    ? 'home'
    : 'none';

  const handleHomeClick = () => {
    closeAllSecondaryOverlays();
    if (isCartOpen) setIsCartOpen(false);
    if (isAccountModalOpen) setIsAccountModalOpen(false);

    if (selectedProduct) {
      closeProductPage();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCartClick = () => {
    closeAllSecondaryOverlays();
    if (isAccountModalOpen) setIsAccountModalOpen(false);
    setIsCartOpen(!isCartOpen);
  };

  const handleAccountClick = () => {
    closeAllSecondaryOverlays();
    if (isCartOpen) setIsCartOpen(false);
    if (isAccountModalOpen) {
      setIsAccountModalOpen(false);
    } else {
      openAccountModal('overview');
    }
  };

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 shadow-[0_-8px_30px_rgba(2,6,23,0.45)] pb-[env(safe-area-inset-bottom)] select-none"
    >
      <div className="grid grid-cols-3 items-center h-16 max-w-md mx-auto px-2">
        {/* 1. HOME */}
        <button
          type="button"
          onClick={handleHomeClick}
          aria-label="Home"
          aria-current={activeTab === 'home' ? 'page' : undefined}
          className={`relative flex flex-col items-center justify-center h-full min-h-[48px] px-2 transition-all duration-150 active:scale-95 cursor-pointer group ${
            activeTab === 'home' ? 'text-[#FF6A00]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {/* Active Top Indicator Pill */}
          <span
            className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-b-full bg-[#FF6A00] transition-all duration-200 ${
              activeTab === 'home' ? 'w-8 opacity-100' : 'w-0 opacity-0'
            }`}
          />

          <div
            className={`relative flex items-center justify-center w-10 h-7 rounded-xl transition-colors duration-150 ${
              activeTab === 'home' ? 'bg-[#FF6A00]/15 text-[#FF6A00]' : 'group-hover:bg-slate-900'
            }`}
          >
            <Home
              className={`w-5 h-5 transition-transform duration-150 ${
                activeTab === 'home' ? 'scale-105 stroke-[2.4]' : 'stroke-[2]'
              }`}
            />
          </div>

          <span
            className={`mt-1 text-[11px] leading-none tracking-tight whitespace-nowrap transition-colors duration-150 ${
              activeTab === 'home' ? 'font-extrabold text-[#FF6A00]' : 'font-semibold text-slate-400 group-hover:text-slate-200'
            }`}
          >
            Home
          </span>
        </button>

        {/* 2. MY CART */}
        <button
          type="button"
          onClick={handleCartClick}
          aria-label={cartCount > 0 ? `My Cart (${cartCount} items)` : 'My Cart'}
          aria-expanded={isCartOpen}
          className={`relative flex flex-col items-center justify-center h-full min-h-[48px] px-2 transition-all duration-150 active:scale-95 cursor-pointer group ${
            activeTab === 'cart' ? 'text-[#FF6A00]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {/* Active Top Indicator Pill */}
          <span
            className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-b-full bg-[#FF6A00] transition-all duration-200 ${
              activeTab === 'cart' ? 'w-8 opacity-100' : 'w-0 opacity-0'
            }`}
          />

          <div
            className={`relative flex items-center justify-center w-10 h-7 rounded-xl transition-colors duration-150 ${
              activeTab === 'cart' ? 'bg-[#FF6A00]/15 text-[#FF6A00]' : 'group-hover:bg-slate-900'
            }`}
          >
            <ShoppingCart
              className={`w-5 h-5 transition-transform duration-150 ${
                activeTab === 'cart' ? 'scale-105 stroke-[2.4]' : 'stroke-[2]'
              }`}
            />

            {/* Live Cart Item Count Badge */}
            {cartCount > 0 && (
              <span
                className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-extrabold font-display tabular-nums flex items-center justify-center shadow-sm transition-transform duration-200 ${
                  activeTab === 'cart'
                    ? 'bg-white text-slate-950 ring-2 ring-[#FF6A00]'
                    : 'bg-[#FF6A00] text-white ring-2 ring-slate-950'
                }`}
              >
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>

          <span
            className={`mt-1 text-[11px] leading-none tracking-tight whitespace-nowrap transition-colors duration-150 ${
              activeTab === 'cart' ? 'font-extrabold text-[#FF6A00]' : 'font-semibold text-slate-400 group-hover:text-slate-200'
            }`}
          >
            My Cart
          </span>
        </button>

        {/* 3. MY ACCOUNT */}
        <button
          type="button"
          onClick={handleAccountClick}
          aria-label={customerAccount ? `My Account (${customerAccount.fullName})` : 'My Account'}
          aria-expanded={isAccountModalOpen}
          className={`relative flex flex-col items-center justify-center h-full min-h-[48px] px-2 transition-all duration-150 active:scale-95 cursor-pointer group ${
            activeTab === 'account' ? 'text-[#FF6A00]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {/* Active Top Indicator Pill */}
          <span
            className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-b-full bg-[#FF6A00] transition-all duration-200 ${
              activeTab === 'account' ? 'w-8 opacity-100' : 'w-0 opacity-0'
            }`}
          />

          <div
            className={`relative flex items-center justify-center w-10 h-7 rounded-xl transition-colors duration-150 ${
              activeTab === 'account' ? 'bg-[#FF6A00]/15 text-[#FF6A00]' : 'group-hover:bg-slate-900'
            }`}
          >
            <User
              className={`w-5 h-5 transition-transform duration-150 ${
                activeTab === 'account' ? 'scale-105 stroke-[2.4]' : 'stroke-[2]'
              }`}
            />

            {/* Signed-in indicator badge when customer is authenticated */}
            {customerAccount && (
              <span
                title={`Signed in as ${customerAccount.fullName}`}
                className="absolute -top-0.5 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950"
              />
            )}
          </div>

          <span
            className={`mt-1 text-[11px] leading-none tracking-tight whitespace-nowrap transition-colors duration-150 ${
              activeTab === 'account' ? 'font-extrabold text-[#FF6A00]' : 'font-semibold text-slate-400 group-hover:text-slate-200'
            }`}
          >
            My Account
          </span>
        </button>
      </div>
    </nav>
  );
};
