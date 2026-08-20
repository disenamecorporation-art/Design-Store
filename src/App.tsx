import React, { useState, useEffect } from 'react';
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
import { AdminPanel4View } from './components/AdminPanel4View';
import { PortfolioView } from './components/PortfolioView';
import { StoreView } from './components/StoreView';
import { CheckoutView } from './components/CheckoutView';
import { CartDrawer } from './components/CartDrawer';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase';
import { Lock, UserPlus, LogIn, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('inicio');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [trackingCodeParam, setTrackingCodeParam] = useState<string>('');
  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setCheckingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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

          {activeTab === 'portafolio' && (
            <motion.div
              key="portafolio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <PortfolioView setActiveTab={setActiveTab} />
            </motion.div>
          )}

          {activeTab === 'calculadora' && (
            <motion.div
              key="calculadora"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative min-h-screen pt-16 pb-20 px-4 sm:px-8 bg-[#fbfbfd] overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-[#fbfbfd] to-[#fbfbfd] pointer-events-none"></div>
              <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center">
                {checkingAuth ? (
                  <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Verificando acceso...</p>
                  </div>
                ) : session ? (
                  <>
                    <div className="text-center space-y-4 mb-16">
                      <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-zinc-900 leading-[1.05]">
                        Calculadora <br className="sm:hidden" /> de cortes.
                      </h1>
                      <p className="text-lg text-zinc-500 font-medium max-w-xl mx-auto">
                        Optimiza tus materiales con precisión y reduce desperdicios.
                      </p>
                    </div>
                    <CutCalculatorView />
                  </>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-md w-full bg-white rounded-[32px] p-8 sm:p-10 border border-zinc-200/85 text-center space-y-8 shadow-xl relative overflow-hidden group"
                  >
                    {/* Background glows */}
                    <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl animate-pulse"></div>
                    <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl animate-pulse delay-700"></div>

                    {/* Lock Icon container */}
                    <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                      <div className="absolute inset-0 bg-amber-50 rounded-[24px] border border-amber-200/50 animate-ping opacity-30"></div>
                      <div className="absolute inset-0 bg-amber-100/50 rounded-[24px] rotate-6 group-hover:rotate-12 transition-transform duration-500"></div>
                      <div className="absolute inset-0 bg-amber-100/30 rounded-[24px] -rotate-6 group-hover:-rotate-12 transition-transform duration-500"></div>
                      <div className="relative w-18 h-18 rounded-[24px] bg-amber-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-500">
                        <Lock className="w-8 h-8 animate-bounce" style={{ animationDuration: '2s' }} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-800 text-[11px] font-black uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Herramienta Premium</span>
                      </span>
                      <h2 className="text-3xl font-black text-zinc-900 tracking-tight leading-none">
                        Acceso Exclusivo
                      </h2>
                      <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                        Para poder calcular y optimizar tus cortes de manera profesional, es necesario estar registrado en nuestro portal de clientes.
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-3 pt-4">
                      <button
                        onClick={() => {
                          setActiveTab('registro');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full py-4 px-6 bg-black hover:bg-zinc-800 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-4.5 h-4.5" />
                        <span>Regístrate para ver por favor</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('entrar');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full py-3.5 px-6 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 font-bold text-xs rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>¿Ya tienes cuenta? Iniciar Sesión</span>
                      </button>
                    </div>

                    {/* Feature badges */}
                    <div className="pt-6 border-t border-zinc-100 flex items-center justify-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1">✨ Registro Gratis</span>
                      <span className="text-zinc-300">•</span>
                      <span className="flex items-center gap-1">📊 Ahorro de Material</span>
                    </div>
                  </motion.div>
                )}
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
              <AccountView setActiveTab={setActiveTab} initialMode="entrar" setTrackingCodeParam={setTrackingCodeParam} />
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
              <AccountView setActiveTab={setActiveTab} initialMode="registro" setTrackingCodeParam={setTrackingCodeParam} />
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
              <AccountView setActiveTab={setActiveTab} initialMode="entrar" setTrackingCodeParam={setTrackingCodeParam} />
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
          {activeTab === 'admin-p4' && (
            <motion.div
              key="admin-p4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <AdminPanel4View />
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
