import React from 'react';
import { TabType, ServiceItem } from '../types';
import { SERVICES_DATA } from '../data';
import { ArrowRight, CheckCircle2, Phone, Sparkles, Maximize2, Box, Zap, Package, Printer } from 'lucide-react';
import { ServiceImageSlider } from './ServiceImageSlider';

interface ServicesViewProps {
  setActiveTab: (tab: TabType) => void;
  onSelectService: (service: ServiceItem) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ setActiveTab }) => {
  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Maximize2': return <Maximize2 className="w-6 h-6 text-zinc-900" />;
      case 'Box': return <Box className="w-6 h-6 text-zinc-900" />;
      case 'Zap': return <Zap className="w-6 h-6 text-zinc-900" />;
      case 'Package': return <Package className="w-6 h-6 text-zinc-900" />;
      case 'Printer': return <Printer className="w-6 h-6 text-zinc-900" />;
      default: return <Sparkles className="w-6 h-6 text-zinc-900" />;
    }
  };

  const handleWhatsAppForService = (serviceTitle: string) => {
    const message = `Hola, deseo solicitar una cotización detallada para el servicio de *${serviceTitle}* con Design Store Venezuela.`;
    const url = `https://wa.me/584145915757?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const getServiceImages = (service: ServiceItem) => {
    if (service.id === 'gigantografia') {
      return [
        'https://i.postimg.cc/xd1W4Xyn/Whats-App-Image-2026-07-30-at-23-13-33.jpg',
        'https://i.postimg.cc/6QpDm8LJ/Whats-App-Image-2026-07-30-at-23-13-33-(1).jpg',
        'https://i.postimg.cc/k5gkp2FC/Whats-App-Image-2026-07-30-at-23-13-33-(2).jpg',
        'https://i.postimg.cc/wBjSG1cd/Whats-App-Image-2026-07-30-at-23-13-33-(3).jpg',
        'https://i.postimg.cc/xd1W4XyV/Whats-App-Image-2026-07-30-at-23-13-34.jpg',
        'https://i.postimg.cc/g02fTxq9/Whats-App-Image-2026-07-30-at-23-13-34-(1).jpg'
      ];
    }
    if (service.id === 'impresion-3d') {
      return [
        'https://i.postimg.cc/QCQ4tDkB/Whats-App-Image-2026-07-30-at-23-12-25.jpg',
        'https://i.postimg.cc/sxY6Xz9Q/Whats-App-Image-2026-07-30-at-23-12-25-(2).jpg',
        'https://i.postimg.cc/Zn87RmFW/Whats-App-Image-2026-07-30-at-23-12-25-(3).jpg'
      ];
    }
    return [service.image];
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-8 bg-zinc-50/50">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-800 shadow-sm">
            <span>Catálogo Especializado</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900">
            Nuestros Servicios & Especialidades
          </h1>
          <p className="text-zinc-600 text-base sm:text-lg leading-relaxed">
            Tecnología de punta, materiales certificados y acabados impecables para satisfacer los estándares más exigentes del mercado venezolano.
          </p>
        </div>

        {/* Detailed Services Grid */}
        <div className="space-y-12">
          {SERVICES_DATA.map((service, idx) => (
            <div 
              key={service.id}
              className={`glass-card rounded-3xl overflow-hidden border border-zinc-200 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                idx % 2 === 1 ? 'lg:grid-flow-dense' : ''
              }`}
            >
              {/* Image Column */}
              <div className={`lg:col-span-5 h-72 sm:h-96 lg:h-full min-h-[320px] relative overflow-hidden ${
                idx % 2 === 1 ? 'lg:col-start-8' : ''
              }`}>
                {/* Slider or Single Image */}
                <ServiceImageSlider images={getServiceImages(service)} alt={service.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="bg-white/90 backdrop-blur-md text-zinc-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    {service.category}
                  </span>
                </div>
              </div>

              {/* Content Column */}
              <div className={`lg:col-span-7 p-8 sm:p-12 space-y-6 ${
                idx % 2 === 1 ? 'lg:col-start-1' : ''
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center shadow-sm border border-zinc-200">
                    {getServiceIcon(service.iconName)}
                  </div>
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-semibold">0{idx + 1} / Servicios</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                  {service.title}
                </h2>

                <p className="text-zinc-700 text-base sm:text-lg leading-relaxed font-normal">
                  {service.fullDesc}
                </p>

                {/* Features checklist */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Aplicaciones & Características:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-sm text-zinc-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-6 border-t border-zinc-200 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => {
                      if (service.id === 'gigantografia' || service.id === 'flexografia-digital') {
                        setActiveTab('cotizar');
                      } else {
                        handleWhatsAppForService(service.title);
                      }
                    }}
                    className="px-6 py-3.5 rounded-full bg-black text-white font-semibold text-sm hover:bg-zinc-800 transition-all shadow-md flex items-center gap-2 group"
                  >
                    <span>Solicitar Cotización</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={() => handleWhatsAppForService(service.title)}
                    className="px-6 py-3.5 rounded-full glass-panel text-zinc-900 font-semibold text-sm hover:bg-zinc-100 transition-all border border-zinc-300 flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Consultar por WhatsApp</span>
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
