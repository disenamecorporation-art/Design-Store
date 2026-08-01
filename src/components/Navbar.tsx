import React, { useState, useEffect } from 'react';
import { TabType } from '../types';
import { Menu, X, ArrowRight, Phone, Sparkles, Search, Instagram, Facebook, Twitter, User, LogOut, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../hooks/useCart';
import { ShoppingBag } from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdmin(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkAdmin(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (currentSession: any) => {
    if (currentSession) {
      const { data } = await supabase.from('profiles').select('role').eq('id', currentSession.user.id).single();
      if (data && data.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveTab('inicio');
    setMobileMenuOpen(false);
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNav = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-8 py-3">
      {/* Social Bar */}
      <div className="max-w-7xl mx-auto flex justify-start gap-4 px-6 pb-2">
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-fuchsia-500 transition-colors">
          <Instagram className="w-3.5 h-3.5" />
        </a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-blue-600 transition-colors">
          <Facebook className="w-3.5 h-3.5" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-sky-500 transition-colors">
          <Twitter className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="max-w-7xl mx-auto glass-panel rounded-3xl px-6 py-4 flex items-center justify-between shadow-sm bg-white/80 backdrop-blur-xl border border-zinc-200/50">
        {/* Logo - Larger */}
        <button 
          onClick={() => handleNav('inicio')}
          className="flex items-center group focus:outline-none shrink-0"
        >
          <div className="w-20 h-20 flex items-center justify-center transition-transform group-hover:scale-105">
            <img 
              src="https://i.postimg.cc/sfSLbNKq/designisotipo.png" 
              alt="Design Store Venezuela" 
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>
        </button>

        {/* Desktop Navigation - Filled solid black Apple pill */}
        <nav className="hidden md:flex items-center gap-2 bg-zinc-100/90 p-2 rounded-full border border-zinc-200 shadow-inner overflow-x-auto mx-4">
          <button
            onClick={() => handleNav('inicio')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold tracking-tight transition-all duration-300 whitespace-nowrap ${
              activeTab === 'inicio'
                ? 'bg-black text-white shadow-md scale-100'
                : 'text-zinc-800 hover:text-black hover:bg-black/10'
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => handleNav('cotizar')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold tracking-tight transition-all duration-300 ${
              activeTab === 'cotizar'
                ? 'bg-black text-white shadow-md scale-100'
                : 'text-zinc-800 hover:text-black hover:bg-black/10'
            }`}
          >
            Realizar mi tarjeta
          </button>
          <button
            onClick={() => handleNav('servicios')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold tracking-tight transition-all duration-300 ${
              activeTab === 'servicios'
                ? 'bg-black text-white shadow-md scale-100'
                : 'text-zinc-800 hover:text-black hover:bg-black/10'
            }`}
          >
            Servicios
          </button>
          <button
            onClick={() => handleNav('store')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold tracking-tight transition-all duration-300 ${
              activeTab === 'store'
                ? 'bg-black text-white shadow-md scale-100'
                : 'text-zinc-800 hover:text-black hover:bg-black/10'
            }`}
          >
            Tienda
          </button>
          <button
            onClick={() => handleNav('calculadora')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold tracking-tight transition-all duration-300 ${
              activeTab === 'calculadora'
                ? 'bg-black text-white shadow-md scale-100'
                : 'text-zinc-800 hover:text-black hover:bg-black/10'
            }`}
          >
            Calculadora
          </button>
          <button
            onClick={() => handleNav('tracking')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold tracking-tight transition-all duration-300 ${
              activeTab === 'tracking'
                ? 'bg-black text-white shadow-md scale-100'
                : 'text-zinc-800 hover:text-black hover:bg-black/10'
            }`}
          >
            Tracking
          </button>
        </nav>

        {/* Right Actions - Two separate buttons: Entrar and Registro */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Buscar servicios..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-48 rounded-full bg-zinc-100/80 border border-zinc-200/50 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300 focus:w-64 focus:bg-white placeholder:text-zinc-400"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-cyan-500 transition-colors" />
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 rounded-full text-zinc-800 hover:bg-zinc-100 transition-colors mr-1"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <div className="h-6 w-px bg-zinc-200 mx-1"></div>

          {session ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <User className="w-5 h-5 group-hover:animate-bounce" />
              </button>
              
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-zinc-100 py-3 z-50 animate-in fade-in slide-in-from-top-4 duration-200 origin-top-right">
                    <div className="px-4 pb-3 mb-2 border-b border-zinc-100">
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Mi Cuenta</p>
                      <p className="text-sm font-semibold text-zinc-900 truncate mt-1">{session.user?.email}</p>
                    </div>
                    
                    <div className="flex flex-col px-2">
                      {isAdmin && (
                        <button
                          onClick={() => { handleNav('admin'); setUserMenuOpen(false); }}
                          className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 ${
                            activeTab === 'admin' ? 'bg-cyan-50 text-cyan-700' : 'text-zinc-600 hover:bg-zinc-50 hover:text-black'
                          }`}
                        >
                          <Settings className="w-4 h-4" />
                          Admin Panel
                        </button>
                      )}
                      <button
                        onClick={() => { handleNav('cuenta'); setUserMenuOpen(false); }}
                        className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 ${
                          activeTab === 'cuenta' ? 'bg-zinc-100 text-black' : 'text-zinc-600 hover:bg-zinc-50 hover:text-black'
                        }`}
                      >
                        <User className="w-4 h-4" />
                        Mi Perfil
                      </button>
                      <button
                        onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                        className="px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 text-red-600 hover:bg-red-50 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => handleNav('entrar')}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 border ${
                  activeTab === 'entrar'
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-white/80 text-zinc-800 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => handleNav('registro')}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 shadow-md ${
                  activeTab === 'registro'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-black text-white hover:bg-zinc-800 hover:scale-[1.02]'
                }`}
              >
                Registro
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 rounded-xl text-zinc-800 hover:bg-zinc-100 transition-colors"
          >
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-zinc-800 hover:bg-zinc-100 focus:outline-none"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 glass-panel rounded-3xl p-6 shadow-xl md:hidden border border-zinc-200/80 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => handleNav('inicio')}
              className={`px-4 py-3 rounded-xl text-left font-semibold text-base transition-colors ${
                activeTab === 'inicio' ? 'bg-black text-white' : 'text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => handleNav('cotizar')}
              className={`px-4 py-3 rounded-xl text-left font-semibold text-base transition-colors ${
                activeTab === 'cotizar' ? 'bg-black text-white' : 'text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              Realizar mi tarjeta
            </button>
            <button
              onClick={() => handleNav('servicios')}
              className={`px-4 py-3 rounded-xl text-left font-semibold text-base transition-colors ${
                activeTab === 'servicios' ? 'bg-black text-white' : 'text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              Catálogo de Servicios
            </button>
            <button
              onClick={() => handleNav('store')}
              className={`px-4 py-3 rounded-xl text-left font-semibold text-base transition-colors ${
                activeTab === 'store' ? 'bg-black text-white' : 'text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              Tienda
            </button>
            <button
              onClick={() => handleNav('calculadora')}
              className={`px-4 py-3 rounded-xl text-left font-semibold text-base transition-colors ${
                activeTab === 'calculadora' ? 'bg-black text-white' : 'text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              Calculadora
            </button>
            <button
              onClick={() => handleNav('tracking')}
              className={`px-4 py-3 rounded-xl text-left font-semibold text-base transition-colors ${
                activeTab === 'tracking' ? 'bg-black text-white' : 'text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              Tracking de Orden
            </button>
            {session ? (
              <div className="flex flex-col gap-2 pt-2 border-t border-zinc-200 mt-2">
                {isAdmin && (
                  <button
                    onClick={() => handleNav('admin')}
                    className={`px-4 py-3 rounded-xl text-left font-semibold text-base transition-colors flex items-center gap-2 ${
                      activeTab === 'admin' ? 'bg-cyan-600 text-white' : 'text-zinc-800 hover:bg-zinc-100'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    Admin Panel
                  </button>
                )}
                <button
                  onClick={() => handleNav('cuenta')}
                  className={`px-4 py-3 rounded-xl text-left font-semibold text-base transition-colors flex items-center gap-2 ${
                    activeTab === 'cuenta' ? 'bg-black text-white' : 'text-zinc-800 hover:bg-zinc-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Ir a Mi Perfil
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 rounded-xl text-left font-semibold text-base transition-colors text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200 mt-2">
                <button
                  onClick={() => handleNav('entrar')}
                  className={`px-4 py-3 rounded-xl text-center font-semibold text-sm transition-colors border ${
                    activeTab === 'entrar' ? 'bg-black text-white border-black' : 'bg-white text-zinc-800 border-zinc-200'
                  }`}
                >
                  Entrar
                </button>
                <button
                  onClick={() => handleNav('registro')}
                  className={`px-4 py-3 rounded-xl text-center font-semibold text-sm transition-colors ${
                    activeTab === 'registro' ? 'bg-emerald-600 text-white' : 'bg-black text-white'
                  }`}
                >
                  Registro
                </button>
              </div>
            )}
            
            <div className="pt-4 mt-2 border-t border-zinc-200 flex flex-col gap-2">
              <a
                href="https://wa.me/584145915757?text=Hola,%20deseo%20más%20información%20sobre%20sus%20servicios."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-50 text-emerald-800 font-semibold text-center flex items-center justify-center gap-2 border border-emerald-200"
              >
                <Phone className="w-4 h-4" />
                <span>Escribir por WhatsApp</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
