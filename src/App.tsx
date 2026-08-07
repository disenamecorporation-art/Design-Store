import React, { useState } from 'react';
import { TabType, ServiceItem } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { CardQuoteView } from './components/CardQuoteView';
import { ServicesView } from './components/ServicesView';
import { AccountView } from './components/AccountView';
import { ImageTutorialView } from './components/ImageTutorialView';
import { CutCalculatorView } from './components/CutCalculatorView';
import { TrackingView } from './components/TrackingView';
import { AdminView } from './components/AdminView';
import { StoreAdminView } from './components/StoreAdminView';
import { AdminPanel3View } from './components/AdminPanel3View';
import { StoreView } from './components/StoreView';
import { CheckoutView } from './components/CheckoutView';
import { CartDrawer } from './components/CartDrawer';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('inicio');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [trackingCodeParam, setTrackingCodeParam] = useState<string>('');

  const handleSelectService = (service: ServiceItem) => {
    setSelectedService(service);
  };

  const navigateToTracking = (code: string) => {
    setTrackingCodeParam(code);
    setActiveTab('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-['Manrope',sans-serif] selection:bg-black selection:text-white flex flex-col justify-between">
      {/* Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content with View Transitions */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {activeTab === 'inicio' && (
            <motion.div
              key="inicio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <HomeView setActiveTab={setActiveTab} onSelectService={handleSelectService} onSearchTracking={navigateToTracking} />
            </motion.div>
          )}

          {activeTab === 'cotizar' && (
            <motion.div
              key="cotizar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <CardQuoteView setActiveTab={setActiveTab} />
            </motion.div>
          )}

          {activeTab === 'tutorial-imagenes' && (
            <motion.div
              key="tutorial-imagenes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <ImageTutorialView setActiveTab={setActiveTab} />
            </motion.div>
          )}

          {activeTab === 'servicios' && (
            <motion.div
              key="servicios"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <ServicesView setActiveTab={setActiveTab} onSelectService={handleSelectService} />
            </motion.div>
          )}

          {activeTab === 'calculadora' && (
            <motion.div
              key="calculadora"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative min-h-screen pt-48 pb-20 px-4 sm:px-8 bg-[#fbfbfd] overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-[#fbfbfd] to-[#fbfbfd] pointer-events-none"></div>
              <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center">
                <div className="text-center space-y-4 mb-16">
                  <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-zinc-900 leading-[1.05]">
                    Calculadora <br className="sm:hidden" /> de cortes.
                  </h1>
                  <p className="text-lg text-zinc-500 font-medium max-w-xl mx-auto">
                    Optimiza tus materiales con precisión y reduce desperdicios.
                  </p>
                </div>
                <CutCalculatorView />
              </div>
            </motion.div>
          )}

          {activeTab === 'entrar' && (
            <motion.div
              key="entrar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <AccountView setActiveTab={setActiveTab} initialMode="entrar" />
            </motion.div>
          )}

          {activeTab === 'registro' && (
            <motion.div
              key="registro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <AccountView setActiveTab={setActiveTab} initialMode="registro" />
            </motion.div>
          )}

          {activeTab === 'cuenta' && (
            <motion.div
              key="cuenta"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <AccountView setActiveTab={setActiveTab} initialMode="entrar" />
            </motion.div>
          )}

          {activeTab === 'tracking' && (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <TrackingView initialTrackingCode={trackingCodeParam} />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <AdminView />
            </motion.div>
          )}
          {activeTab === 'store-admin' && (
            <motion.div
              key="store-admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <StoreAdminView />
            </motion.div>
          )}
          {activeTab === 'admin-p3' && (
            <motion.div
              key="admin-p3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <AdminPanel3View />
            </motion.div>
          )}
          {activeTab === 'store' && (
            <motion.div
              key="store"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <StoreView />
            </motion.div>
          )}
          {activeTab === 'checkout' && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <CheckoutView setActiveTab={setActiveTab} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <CartDrawer setActiveTab={setActiveTab} />
      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
