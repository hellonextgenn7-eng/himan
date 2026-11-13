import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { VisualBrandCards } from './components/VisualBrandCards';
import { CuratedShowcases } from './components/CuratedShowcases';
import { PromoBanner } from './components/PromoBanner';
import { ProductGrid } from './components/ProductGrid';
import { WhyChooseUs } from './components/WhyChooseUs';
import { HowItWorks } from './components/HowItWorks';
import { CustomerReviews } from './components/CustomerReviews';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ChatbotWidget } from './components/ChatbotWidget';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { PolicyModal } from './components/PolicyModal';
import { CustomerAccountModal } from './components/CustomerAccountModal';
import { CompareModal } from './components/CompareModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Toast } from './components/Toast';
import { ProductDetailPage } from './components/ProductDetailPage';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CustomerProtectionBanner } from './components/CustomerProtectionBanner';

const StorefrontContent: React.FC = () => {
  const { isAdminViewOpen, selectedProduct, closeProductPage } = useStore();
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const scrollToCatalog = () => {
    const el = document.getElementById('smartphones-catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToDeals = () => {
    const el = document.getElementById('best-deals');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Dedicated Full-Screen Manager Admin Hub
  if (isAdminViewOpen) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans w-full max-w-full overflow-x-hidden">
        <AdminDashboard />
        <Toast />
      </div>
    );
  }

  // 2. Dedicated Full-Screen Product Details Page (No popup modal, covers 100% width, min-h-100vh)
  if (selectedProduct) {
    return (
      <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#FF6A00] selection:text-white flex flex-col justify-between overflow-x-hidden w-full max-w-full">
        {/* Full-Screen Product View with Sticky Back/Breadcrumb Header, single vertical scroll & Sticky Bottom Purchase Bar */}
        <ProductDetailPage />

        {/* Footer */}
        <Footer
          onSelectBrand={(brand) => {
            setSelectedBrand(brand);
            setSearchQuery('');
            closeProductPage();
          }}
        />

        {/* Floating Chatbot, Mobile Bottom Nav & Action Drawers */}
        <ChatbotWidget />
        <MobileBottomNav />
        <CartDrawer />
        <CheckoutModal />
        <OrderTrackingModal />
        <CustomerAccountModal />
        <CompareModal />
        <PolicyModal />
        <Toast />
      </div>
    );
  }

  // 3. Public Storefront Homepage
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#FF6A00] selection:text-white flex flex-col justify-between overflow-x-hidden w-full max-w-full">
      {/* Top Header Navbar */}
      <Navbar
        onNavigateSection={(id) => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        onSearchSubmit={(q) => {
          setSearchQuery(q);
          scrollToCatalog();
        }}
      />

      <main className="w-full overflow-x-hidden">
        {/* 1. Hero Section with Floating Smartphone Renders & Prominent Search */}
        <HeroSection
          onExploreClick={scrollToCatalog}
          onBestDealsClick={scrollToDeals}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          onSearchSubmit={(q) => {
            setSearchQuery(q);
            scrollToCatalog();
          }}
        />

        {/* 2. Visual Brand Showcase (12 Brands) */}
        <VisualBrandCards
          selectedBrand={selectedBrand}
          onSelectBrand={(brand) => {
            setSelectedBrand(brand);
            setSearchQuery('');
          }}
        />

        {/* 3. Curated Visual Shelves: Deals, iPhones, Samsung Flagships */}
        <CuratedShowcases
          onExploreMore={(brand) => {
            if (brand) setSelectedBrand(brand);
            setSearchQuery('');
            scrollToCatalog();
          }}
        />

        {/* 4. Promotional Upgrade Banner */}
        <PromoBanner onActionClick={scrollToCatalog} />

        {/* 5. 6-Month Customer Protection Guarantee Banner */}
        <CustomerProtectionBanner />

        {/* 6. Comprehensive Smartphones Catalog with Compact Filter Drawer & Pagination */}
        <ProductGrid
          selectedBrand={selectedBrand}
          onSelectBrand={setSelectedBrand}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          onClearSearch={() => setSearchQuery('')}
        />

        {/* 6. Why Choose Phone Bazar */}
        <WhyChooseUs />

        {/* 7. How It Works */}
        <HowItWorks />

        {/* 8. Customer Reviews & Ratings */}
        <CustomerReviews />

        {/* 9. Contact & Email Support */}
        <ContactSection />
      </main>

      {/* Professional Footer */}
      <Footer
        onSelectBrand={(brand) => {
          setSelectedBrand(brand);
          setSearchQuery('');
          scrollToCatalog();
        }}
      />

      {/* Floating Gemini AI Smartphone Advisor, Mobile Bottom Nav & Support Chatbot */}
      <ChatbotWidget />
      <MobileBottomNav />

      {/* Functional Drawers & Modals (Cart, Checkout, Order Tracking, Account, Exchange, Compare) */}
      <CartDrawer />
      <CheckoutModal />
      <OrderTrackingModal />
      <CustomerAccountModal />
      <CompareModal />
      <PolicyModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <StorefrontContent />
    </StoreProvider>
  );
}
