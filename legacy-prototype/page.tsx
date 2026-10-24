'use client';

import React, { useState } from 'react';
import { BookingProvider, useBooking } from '@/context/BookingContext';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { InstantBookingModal } from '@/components/InstantBookingModal';
import { PasswordlessLoginModal } from '@/components/CustomerPortal/PasswordlessLoginModal';
import { CleanCatalogSection } from '@/components/CleanCatalogSection';
import { CustomerDashboard } from '@/components/CustomerPortal/CustomerDashboard';
import { AdminDashboard } from '@/components/AdminPortal/AdminDashboard';
import { ComparisonSection } from '@/components/ComparisonSection';
import { ReviewsSection } from '@/components/ReviewsSection';
import { FAQSection } from '@/components/FAQSection';
import { ConversionBanner } from '@/components/ConversionBanner';
import { Footer } from '@/components/Footer';
import { ServiceType } from '@/types/cleaning';

function MainApp() {
  const { activeView, setActiveView, updateForm } = useBooking();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleOpenBooking = () => {
    setIsBookingModalOpen(true);
  };

  const handleSelectServiceAndBook = (serviceId: ServiceType) => {
    updateForm({ serviceType: serviceId });
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = () => {
    setActiveView('portal');
  };

  const handleLoginSuccess = () => {
    setActiveView('portal');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar
        onOpenBooking={handleOpenBooking}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      <main className="flex-1">
        {activeView === 'landing' ? (
          <>
            {/* 1. High-Converting Hero with Instant Calculator */}
            <Hero onOpenBookingModal={handleOpenBooking} />

            {/* 2. Room-by-room Service Standards & Inclusions */}
            <CleanCatalogSection onSelectServiceAndBook={handleSelectServiceAndBook} />

            {/* 3. Honest Side-by-Side Comparison vs Traditional Cleaning Agencies */}
            <ComparisonSection />

            {/* 4. Verified Customer Reviews & Social Proof */}
            <ReviewsSection />

            {/* 5. Frequently Asked Questions (FAQ) */}
            <FAQSection />

            {/* 6. High-Converting Call to Action Banner */}
            <ConversionBanner onBookNow={handleOpenBooking} />
          </>
        ) : activeView === 'portal' ? (
          /* Customer Portal & Bookings Tracker */
          <CustomerDashboard onBookNewClean={handleOpenBooking} />
        ) : (
          /* Admin Platform Control Center & Logs */
          <AdminDashboard />
        )}
      </main>

      {/* 30-Second Booking Modal with User Fields & Auto-Account Creation */}
      <InstantBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={handleBookingSuccess}
      />

      {/* Passwordless 1-Click Login Modal */}
      <PasswordlessLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <BookingProvider>
      <MainApp />
    </BookingProvider>
  );
}
