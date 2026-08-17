import React from 'react';
import { TabType } from '../types';
import { Phone, Mail, MapPin, Instagram, Globe, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: TabType) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-[#111111] text-white pt-20 pb-12 px-4 sm:px-8 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
        
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-2 shadow-md">
              <img 
                src="https://i.postimg.cc/sfSLbNKq/designisotipo.png" 
                alt="Design Store Venezuela" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="block font-bold text-lg tracking-tight text-white leading-none">Design Store</span>
              <span className="text-xs font-medium tracking-widest text-zinc-400 uppercase">Venezuela</span>
            </div>
          </div>
          
          <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
            Líderes en soluciones de impresión de gran formato, impresión 3D, grabados láser de alta precisión y diseño gráfico para empaques en toda Venezuela. Calidad insuperable y acabados de nivel internacional.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a 
              href="https://wa.me/584145915757" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
              aria-label="WhatsApp"
            >
              <Phone className="w-5 h-5" />
            </a>
            <a 
              href="mailto:contacto@dstorevzla.com" 
              className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300">Navegación</h3>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li>
              <button onClick={() => { setActiveTab('inicio'); window.scrollTo(0,0); }} className="hover:text-white transition-colors">
                Inicio / Landing
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('cotizar'); window.scrollTo(0,0); }} className="hover:text-white transition-colors flex items-center gap-1">
                <span>Cotizador de Tarjetas 3D</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('servicios'); window.scrollTo(0,0); }} className="hover:text-white transition-colors">
                Catálogo de Servicios
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('portafolio'); window.scrollTo(0,0); }} className="hover:text-white transition-colors font-bold text-amber-400">
                Portafolio de Servicios
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('cuenta'); window.scrollTo(0,0); }} className="hover:text-white transition-colors">
                Área de Clientes
              </button>
            </li>
          </ul>
        </div>

        {/* Services Links */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300">Servicios Clave</h3>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li>
              <button onClick={() => { setActiveTab('servicios'); window.scrollTo(0,0); }} className="hover:text-white transition-colors text-left">
                Gigantografía & Vallas
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('servicios'); window.scrollTo(0,0); }} className="hover:text-white transition-colors text-left">
                Impresión 3D Prototipado
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('servicios'); window.scrollTo(0,0); }} className="hover:text-white transition-colors text-left">
                Grabados y Corte Láser
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('servicios'); window.scrollTo(0,0); }} className="hover:text-white transition-colors text-left">
                Diseño Gráfico para Empaques
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('servicios'); window.scrollTo(0,0); }} className="hover:text-white transition-colors text-left">
                Impresión Digital y Flexografía
              </button>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-300">Contacto</h3>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
              <span>Zona Industrial Carabobo 2 Nort Suiza, Bello monte 2 Av. Pinto salinas</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>+58 (414) 591-5757</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>ventas@dstorevzla.com</span>
            </li>
            <li className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>Envíos a todo el territorio nacional</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
        <p>© {new Date().getFullYear()} Design Store Venezuela. Todos los derechos reservados. |{' '}
          <a 
            href="https://instagram.com/legaint.ve" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-black text-amber-500 hover:text-amber-400 hover:underline transition-colors tracking-wide"
          >
            Hecho por Legaint Corporation
          </a>
          <button onClick={() => { setActiveTab('admin'); window.scrollTo(0,0); }} className="ml-2 text-zinc-800 hover:text-zinc-500 opacity-20 hover:opacity-100 transition-opacity">
            Admin CRM
          </button>
          <button onClick={() => { setActiveTab('admin-p3'); window.scrollTo(0,0); }} className="ml-2 text-zinc-800 hover:text-amber-500 opacity-20 hover:opacity-100 transition-opacity">
            Admin Panel #3
          </button>
          <button onClick={() => { setActiveTab('admin-p4'); window.scrollTo(0,0); }} className="ml-2 text-zinc-800 hover:text-amber-400 opacity-20 hover:opacity-100 transition-opacity font-bold">
            Admin Panel #4
          </button>
        </p>
        <div className="flex items-center gap-6">
          <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-zinc-400 transition-colors">Política de Privacidad</a>
          <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-zinc-400 transition-colors">Términos de Servicio</a>
          <a href="#sitemap" onClick={(e) => e.preventDefault()} className="hover:text-zinc-400 transition-colors">Mapa del Sitio</a>
        </div>
      </div>
    </footer>
  );
};
