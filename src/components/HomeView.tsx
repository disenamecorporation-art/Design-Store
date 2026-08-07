import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TabType, ServiceItem } from '../types';
import { SERVICES_DATA } from '../data';
import { ArrowRight, Sparkles, CheckCircle2, Send, PenTool, Printer, Layers, Zap, MapPin, Mail, Phone, Briefcase, Calendar, Users, Award, TrendingUp, Calculator, Search } from 'lucide-react';

interface HomeViewProps {
  setActiveTab: (tab: TabType) => void;
  onSelectService: (service: ServiceItem) => void;
  onSearchTracking?: (code: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setActiveTab, onSearchTracking }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentSlide3D, setCurrentSlide3D] = useState(0);
  const [currentSlideDiseno, setCurrentSlideDiseno] = useState(0);
  const [currentSlideLaser, setCurrentSlideLaser] = useState(0);
  const [trackingCode, setTrackingCode] = useState('');

  const gigantografiaImages = [
    'https://i.postimg.cc/xd1W4Xyn/Whats-App-Image-2026-07-30-at-23-13-33.jpg',
    'https://i.postimg.cc/6QpDm8LJ/Whats-App-Image-2026-07-30-at-23-13-33-(1).jpg',
    'https://i.postimg.cc/k5gkp2FC/Whats-App-Image-2026-07-30-at-23-13-33-(2).jpg',
    'https://i.postimg.cc/wBjSG1cd/Whats-App-Image-2026-07-30-at-23-13-33-(3).jpg',
    'https://i.postimg.cc/xd1W4XyV/Whats-App-Image-2026-07-30-at-23-13-34.jpg',
    'https://i.postimg.cc/g02fTxq9/Whats-App-Image-2026-07-30-at-23-13-34-(1).jpg',
    'https://i.postimg.cc/MGNqJkLp/Whats-App-Image-2026-08-01-at-19-38-04-(3).jpg',
    'https://i.postimg.cc/XYD09S4w/Whats-App-Image-2026-08-01-at-19-36-02.jpg',
    'https://i.postimg.cc/mg6G7fB1/Whats-App-Image-2026-08-01-at-19-36-32.jpg',
    'https://i.postimg.cc/Cx6VbTSB/Whats-App-Image-2026-08-01-at-19-36-32-(1).jpg',
    'https://i.postimg.cc/vZSd5Fbm/Whats-App-Image-2026-08-01-at-19-36-32-(2).jpg',
    'https://i.postimg.cc/9QNjy5CM/Whats-App-Image-2026-08-01-at-19-36-32-(3).jpg',
    'https://i.postimg.cc/g2BP3Fmm/Whats-App-Image-2026-08-01-at-19-36-32-(4).jpg',
    'https://i.postimg.cc/W1fP0LTj/Whats-App-Image-2026-08-01-at-19-38-02.jpg',
    'https://i.postimg.cc/52tVHNd6/Whats-App-Image-2026-08-01-at-19-38-02-(1).jpg',
    'https://i.postimg.cc/qv7TtMVp/Whats-App-Image-2026-08-01-at-19-38-03.jpg',
    'https://i.postimg.cc/Bnv08Q9s/Whats-App-Image-2026-08-01-at-19-38-03-(1).jpg',
    'https://i.postimg.cc/fRbN3Tnh/Whats-App-Image-2026-08-01-at-19-38-03-(2).jpg',
    'https://i.postimg.cc/vZms1HFF/Whats-App-Image-2026-08-01-at-19-38-04.jpg',
    'https://i.postimg.cc/13zQg5hx/Whats-App-Image-2026-08-01-at-19-38-04-(1).jpg',
    'https://i.postimg.cc/SxKhXN0w/Whats-App-Image-2026-08-01-at-19-38-04-(2).jpg'
  ];

  const impresiones3DImages = [
    'https://i.postimg.cc/8c3QZz6C/Whats-App-Image-2026-08-01-at-19-59-57.jpg',
    'https://i.postimg.cc/L57Kx81X/Whats-App-Image-2026-08-01-at-19-59-57-(1).jpg',
    'https://i.postimg.cc/Kj4h7MRM/Whats-App-Image-2026-08-01-at-19-59-57-(2).jpg',
    'https://i.postimg.cc/C5tTcxqq/Whats-App-Image-2026-08-01-at-19-59-58.jpg',
    'https://i.postimg.cc/rsbXfwrR/Whats-App-Image-2026-08-01-at-19-59-58-(1).jpg',
    'https://i.postimg.cc/rsbXfwr0/Whats-App-Image-2026-08-01-at-19-59-58-(2).jpg',
    'https://i.postimg.cc/90S5LQ74/Whats-App-Image-2026-08-01-at-19-59-58-(3).jpg',
    'https://i.postimg.cc/90S5LQ7D/Whats-App-Image-2026-08-01-at-19-59-58-(4).jpg',
    'https://i.postimg.cc/PJcsS5wN/Whats-App-Image-2026-08-01-at-19-59-58-(5).jpg',
    'https://i.postimg.cc/4yMkWx9y/Whats-App-Image-2026-08-01-at-19-59-58-(6).jpg'
  ];

  const disenoGraficoImages = [
    'https://i.postimg.cc/Nj6ZGycV/Whats-App-Image-2026-08-03-at-21-45-17.jpg',
    'https://i.postimg.cc/SKm3nyQS/Whats-App-Image-2026-08-03-at-21-46-18-(1).jpg',
    'https://i.postimg.cc/g045RfrK/Whats-App-Image-2026-08-03-at-21-46-18.jpg',
    'https://i.postimg.cc/PqKcZBNQ/Whats-App-Image-2026-08-03-at-21-46-18-(2).jpg',
    'https://i.postimg.cc/7LXc7pbM/Whats-App-Image-2026-08-03-at-21-46-19.jpg',
    'https://i.postimg.cc/6QzSRDTd/Whats-App-Image-2026-08-03-at-21-46-19-(1).jpg'
  ];

  const grabadosLaserImages = [
    'https://i.postimg.cc/hG9m5BVG/Whats-App-Image-2026-08-03-at-21-03-10.jpg',
    'https://i.postimg.cc/LsdfDXgq/Whats-App-Image-2026-08-03-at-21-03-10-(1).jpg',
    'https://i.postimg.cc/1zpFjQDm/Whats-App-Image-2026-08-03-at-21-03-10-(2).jpg',
    'https://i.postimg.cc/yNFRbH0s/Whats-App-Image-2026-08-03-at-21-03-10-(3).jpg',
    'https://i.postimg.cc/R0rfdFJW/Whats-App-Image-2026-08-03-at-21-03-10-(4).jpg',
    'https://i.postimg.cc/HLG5zx8Y/Whats-App-Image-2026-08-03-at-21-03-10-(5).jpg'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % gigantografiaImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [gigantografiaImages.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide3D((prev) => (prev + 1) % impresiones3DImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [impresiones3DImages.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideDiseno((prev) => (prev + 1) % disenoGraficoImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [disenoGraficoImages.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideLaser((prev) => (prev + 1) % grabadosLaserImages.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [grabadosLaserImages.length]);

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-zinc-900 font-sans selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* Apple-Style Hero Section */}
      <section className="relative min-h-[95vh] flex items-center pt-24 pb-20 px-4 sm:px-8 overflow-hidden bg-[#fbfbfd]">
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-cyan-200/40 rounded-full blur-[100px] animate-[spin_30s_linear_infinite]"></div>
          <div className="absolute -bottom-1/4 -right-1/4 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-fuchsia-200/40 rounded-full blur-[100px] animate-[spin_35s_linear_infinite_reverse]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] bg-amber-200/30 rounded-full blur-[90px] animate-pulse"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Text & CTA */}
          <div className="space-y-8 text-left pt-10 lg:pt-0">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-zinc-200/50 text-sm font-semibold text-zinc-800 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400 animate-pulse"></span>
              Especialistas en CMYK & RGB
            </div>
            
            <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-zinc-900 leading-[1.05]">
              Creatividad,<br />tecnología y<br />frescura visual.
            </h1>

            <p className="text-xl sm:text-2xl text-zinc-500 font-medium max-w-xl tracking-tight pt-2 leading-relaxed">
              Impulsamos marcas con artes gráficas, empaques flexibles y flexografía de primera línea.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
              <button
                onClick={() => {
                  document.getElementById('cotizacion')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-10 py-5 w-full sm:w-auto rounded-full bg-zinc-900 text-white font-semibold text-base hover:bg-black transition-all shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] hover:-translate-y-1 flex items-center justify-center gap-2 group"
              >
                <span>Comenzar Proyecto</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right: Plotter Image floating with 3D effect */}
          <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[700px] mt-12 lg:mt-0 z-10 flex items-center justify-center perspective-[2000px]">
            {/* Glass platform for the printer to sit on, conceptually */}
            <div className="absolute bottom-10 w-3/4 h-20 bg-black/10 blur-2xl rounded-[100%] transform -rotate-x-45 translate-y-20"></div>
            
            <div className="relative w-full h-full animate-[float_6s_ease-in-out_infinite] flex items-center justify-center lg:scale-125">
              <img 
                src="https://i.postimg.cc/zDwY3YfM/Whats-App-Image-2026-07-30-at-23-11-18-Photoroom.png" 
                alt="Impresora Plotter Avanzada" 
                className="w-full h-full object-contain filter drop-shadow-[0_50px_50px_rgba(0,0,0,0.25)] transition-transform duration-700 hover:scale-[1.02]"
                style={{ transform: 'translateZ(50px)' }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* Stats Section with Glassmorphism */}
      <section className="py-12 px-4 sm:px-8 bg-[#fbfbfd] relative -mt-12 z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { value: '+15', label: 'Años de Experiencia', icon: Calendar, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-100' },
            { value: '10k+', label: 'Proyectos Creados', icon: Briefcase, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-100' },
            { value: '98%', label: 'Clientes Satisfechos', icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-100' },
            { value: '100%', label: 'Calidad Premium', icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-100' }
          ].map((stat, i) => (
            <div key={i} className={`glass-panel bg-white/70 backdrop-blur-xl border-t border-l border-white/80 border-b border-r ${stat.border} rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 group relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10 shadow-inner`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight mb-2 relative z-10 drop-shadow-sm">
                {stat.value}
              </h3>
              <p className="text-[11px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest relative z-10">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tracking Search Section - Apple Style Premium */}
      <section className="py-24 px-4 sm:px-8 relative overflow-hidden flex justify-center bg-white">
        {/* Dynamic Background elements for Apple aesthetic */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-cyan-100 via-fuchsia-50 to-blue-50 rounded-full blur-[100px] opacity-70 pointer-events-none" />

        <div className="max-w-5xl w-full mx-auto relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="group relative"
          >
            {/* Animated glowing border effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-blue-400 rounded-[2.5rem] blur opacity-15 group-hover:opacity-30 transition duration-1000" />
            
            <div className="relative bg-white/40 backdrop-blur-3xl border border-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-[2.5rem] p-10 sm:p-16 flex flex-col md:flex-row items-center gap-12 justify-between overflow-hidden">
              
              {/* Decorative inner gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-100/40 to-fuchsia-100/40 rounded-full blur-[60px] pointer-events-none" />

              <div className="text-center md:text-left space-y-4 md:max-w-md relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 shadow-sm border border-black/5 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">En tiempo real</span>
                </div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight">
                  Rastrea el estatus <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-400 font-medium">de tu orden.</span>
                </h3>
              </div>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (trackingCode.trim() && onSearchTracking) {
                    onSearchTracking(trackingCode.trim());
                  }
                }}
                className="w-full md:w-auto flex-1 max-w-lg relative z-10"
              >
                <div className="relative flex items-center group/form">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <Search className="w-6 h-6 text-zinc-400 group-focus-within/form:text-cyan-500 transition-colors duration-300" />
                  </div>
                  <input
                    type="text"
                    placeholder="Código (Ej. 20517462)"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    className="w-full pl-16 pr-36 py-6 bg-white/90 backdrop-blur-xl border border-zinc-200/50 rounded-full text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-medium text-lg"
                  />
                  <button
                    type="submit"
                    disabled={!trackingCode.trim()}
                    className="absolute inset-y-2 right-2 px-8 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white rounded-full font-bold transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95"
                  >
                    Buscar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Servicios de Gigantografía Section */}
      <section className="py-32 px-4 sm:px-8 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1 relative h-[600px] rounded-[3rem] overflow-hidden bg-zinc-100 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] border border-zinc-200 group">
            {gigantografiaImages.map((src, index) => (
              <img 
                key={src}
                src={src} 
                alt={`Servicios de Gigantografía ${index + 1}`} 
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                  index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
              />
            ))}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
              {gigantografiaImages.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Ir a la imagen ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <div className="space-y-8 order-1 lg:order-2">
            <div className="w-16 h-16 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center shadow-sm">
              <Printer className="w-8 h-8" />
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.05]">
              Diseño e impresión de Gigantografía.
            </h2>
            <p className="text-xl text-zinc-500 font-medium leading-relaxed max-w-lg">
              Soluciones a gran escala para visibilidad exterior e interior.
            </p>
            <ul className="space-y-4 pt-4">
              {[
                'Etiquetas',
                'Pendones',
                'Vallas publicitarias',
                'Rotulados',
                'Y entre otros'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-800 font-semibold text-lg">
                  <CheckCircle2 className="w-6 h-6 text-cyan-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="pt-4">
              <button
                onClick={() => {
                  const message = encodeURIComponent('Hola, deseo solicitar una cotización detallada para el servicio de *Gigantografía* (Etiquetas, Pendones, Vallas, Rotulados) con Design Store Venezuela.');
                  window.open(`https://wa.me/584145915757?text=${message}`, '_blank');
                }}
                className="px-8 py-4 rounded-full bg-zinc-900 hover:bg-black text-white font-bold text-sm shadow-xl flex items-center gap-3 transition-all hover:-translate-y-0.5"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Cotizar Gigantografía por WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Impresión 3D Section */}
      <section className="py-32 px-4 sm:px-8 bg-[#fbfbfd] relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center shadow-sm">
              <Layers className="w-8 h-8" />
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.05]">
              Impresión 3D<br />Bambu Lab.
            </h2>
            <p className="text-xl text-zinc-500 font-medium leading-relaxed max-w-lg">
              Tecnología de última generación para modelado rápido, piezas precisas y prototipos funcionales con calidad impecable.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div>
                <div className="text-3xl font-bold text-zinc-900 flex items-center gap-2"><Zap className="w-6 h-6 text-green-500 fill-current" /> Alta</div>
                <div className="text-zinc-500 text-sm mt-1 uppercase tracking-wider font-bold">Velocidad</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-zinc-900">Extrema</div>
                <div className="text-zinc-500 text-sm mt-1 uppercase tracking-wider font-bold">Precisión</div>
              </div>
            </div>
          </div>
          <div className="relative h-[600px] rounded-[3rem] overflow-hidden bg-zinc-200 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] border border-zinc-300 group">
            {impresiones3DImages.map((src, index) => (
              <img 
                key={src}
                src={src} 
                alt={`Impresión 3D Bambu Lab ${index + 1}`} 
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                  index === currentSlide3D ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
              />
            ))}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
              {impresiones3DImages.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentSlide3D(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i === currentSlide3D ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Ir a la imagen 3D ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grabados Láser Section */}
      <section className="py-32 px-4 sm:px-8 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1 relative h-[600px] rounded-[3rem] overflow-hidden bg-zinc-100 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] border border-zinc-200 group">
            {grabadosLaserImages.map((src, index) => (
              <img 
                key={src}
                src={src} 
                alt={`Grabado Láser ${index + 1}`} 
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                  index === currentSlideLaser ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
              />
            ))}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
              {grabadosLaserImages.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentSlideLaser(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i === currentSlideLaser ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Ir a la imagen de grabado láser ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <div className="space-y-8 order-1 lg:order-2">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.05]">
              Información de<br />Grabados Láser.
            </h2>
            <p className="text-xl text-zinc-500 font-medium leading-relaxed max-w-lg">
              Cortes perfectos y grabados de alta definición para personalización de piezas, maderas, acrílicos y otros materiales.
            </p>
          </div>
        </div>
      </section>

      {/* Diseño Gráfico Section */}
      <section className="py-32 px-4 sm:px-8 bg-zinc-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[3rem] overflow-hidden bg-white shadow-[0_20px_80px_-20px_rgba(0,0,0,0.08)] border border-zinc-100 p-10 sm:p-20">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fuchsia-100/50 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-100/50 rounded-full blur-[80px] pointer-events-none translate-y-1/3 -translate-x-1/3"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-center">
              <div className="flex-1 space-y-8 text-center lg:text-left">
                <div className="w-16 h-16 mx-auto lg:mx-0 rounded-2xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center shadow-sm ring-1 ring-fuchsia-100">
                  <PenTool className="w-8 h-8" />
                </div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.05]">
                  Servicios de <br className="hidden lg:block" />diseño gráfico.
                </h2>
                <p className="text-xl text-zinc-500 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Desarrollo de marcas, branding, diseño de empaques listos para la imprenta, creación de logos y todo lo relacionado a las artes gráficas.
                </p>
                <div className="pt-4 flex justify-center lg:justify-start">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 text-sm font-semibold text-zinc-800">
                    <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
                    Soluciones creativas a medida
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full relative h-[450px] sm:h-[520px] rounded-[2.5rem] overflow-hidden bg-zinc-100 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] border border-zinc-200 group shrink-0">
                {disenoGraficoImages.map((src, index) => (
                  <img 
                    key={src}
                    src={src} 
                    alt={`Servicios de Diseño Gráfico ${index + 1}`} 
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                      index === currentSlideDiseno ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                    }`}
                  />
                ))}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                  {disenoGraficoImages.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentSlideDiseno(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        i === currentSlideDiseno ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Ir a la imagen de diseño gráfico ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-24 px-4 sm:px-8 bg-[#fbfbfd] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-100 via-[#fbfbfd] to-[#fbfbfd] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="glass-panel bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-10 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-100/50 rounded-full blur-[80px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-100/50 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>

            <div className="text-left space-y-4 max-w-xl relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 text-xs font-bold text-cyan-600 border border-cyan-100">
                <Calculator className="w-4 h-4" />
                Nueva Herramienta
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
                Optimiza tus Cortes
              </h2>
              <p className="text-lg text-zinc-500 font-medium leading-relaxed">
                Calcula la cantidad óptima de stickers o piezas gráficas que entran en un pliego para minimizar el desperdicio. Ahorra material en cada proyecto.
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <button
                onClick={() => {
                  setActiveTab('calculadora');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group relative px-8 py-5 rounded-[1.5rem] bg-zinc-900 text-white font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] animate-[bounce_3s_ease-in-out_infinite]"
              >
                <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-zinc-800 to-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">Ir a la calculadora</span>
                <ArrowRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards / Points Section - New Apple Style Design */}
      <section className="py-24 px-4 sm:px-8 bg-zinc-50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-[3rem] bg-zinc-900 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-zinc-800">
            
            {/* Dynamic Mesh Background inside the dark card */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
               <motion.div 
                 animate={{
                   scale: [1, 1.2, 1],
                   rotate: [0, 90, 0],
                   opacity: [0.4, 0.6, 0.4]
                 }}
                 transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                 className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-b from-cyan-500/20 to-fuchsia-600/20 rounded-full blur-[100px]"
               />
               <motion.div 
                 animate={{
                   scale: [1, 1.5, 1],
                   rotate: [0, -90, 0],
                   opacity: [0.3, 0.5, 0.3]
                 }}
                 transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                 className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] bg-gradient-to-t from-fuchsia-500/20 to-cyan-600/20 rounded-full blur-[100px]"
               />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-10 sm:p-20 gap-16">
              
              {/* Text content */}
              <div className="flex-1 text-center lg:text-left space-y-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold text-white shadow-xl"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Programa de Recompensas
                </motion.div>
                
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                  Tus proyectos, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">tienen su premio.</span>
                </h2>
                
                <p className="text-lg sm:text-xl text-zinc-400 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  Acumula <strong className="text-white">Puntos Design</strong> con cada servicio. Canjéalos por descuentos exclusivos y beneficios premium directamente desde tu cuenta.
                </p>
              </div>

              {/* Animated Floating Card */}
              <div className="flex-1 flex justify-center perspective-[2000px]">
                <motion.div
                  animate={{ 
                    rotateY: [-15, 15, -15],
                    rotateX: [10, -10, 10],
                    y: [-15, 15, -15]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative w-64 h-96 sm:w-72 sm:h-[26rem] rounded-[2rem] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_30px_60px_rgba(0,182,212,0.15)] overflow-hidden flex flex-col justify-between p-8 transform-style-3d group"
                >
                  {/* Glass reflections */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/30 pointer-events-none"></div>
                  
                  {/* Shimmer sweep effect */}
                  <motion.div 
                    animate={{
                      x: ['-100%', '200%']
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                      repeatDelay: 1
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  />

                  {/* Top section */}
                  <div className="flex justify-between items-start relative z-10">
                    <img src="https://i.postimg.cc/sfSLbNKq/designisotipo.png" alt="Logo" className="w-10 h-10 brightness-0 invert opacity-90" />
                    <span className="px-3 py-1 bg-black/40 rounded-full text-[10px] font-bold text-white/90 tracking-widest border border-white/10">PREMIUM</span>
                  </div>

                  {/* Middle section (Chip/Pattern) */}
                  <div className="relative z-10 space-y-2">
                    <div className="w-12 h-10 rounded bg-gradient-to-br from-zinc-300 to-zinc-500 opacity-80 border border-zinc-200/50 shadow-inner"></div>
                  </div>

                  {/* Bottom section */}
                  <div className="relative z-10 space-y-1">
                    <p className="text-xs font-semibold text-zinc-300 tracking-[0.2em] uppercase">Puntos Design</p>
                    <p className="text-xl font-bold text-white tracking-widest font-mono">**** **** **** 2026</p>
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section id="cotizacion" className="py-32 px-4 sm:px-8 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-100/40 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-cyan-100/40 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto">
          <div className="bg-[#fbfbfd] rounded-[3rem] p-8 sm:p-16 border border-zinc-200/50 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.05)] relative z-10 overflow-hidden">
            
            {/* Inner background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl max-h-3xl bg-white rounded-full blur-[120px] pointer-events-none opacity-60"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10 items-start">
              {/* Left: Info */}
              <div className="space-y-12 lg:sticky lg:top-32">
                <div className="space-y-6">
                  <h2 className="text-5xl sm:text-6xl font-bold text-zinc-900 tracking-tight leading-[1.05]">
                    Cotiza tu proyecto.
                  </h2>
                  <p className="text-zinc-500 text-xl font-medium max-w-md leading-relaxed">
                    Estamos listos para transformar tus ideas. Por favor, completa los datos y adjunta tus artes.
                  </p>
                </div>

                <div className="space-y-8">
                  <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
                    <h4 className="font-bold text-zinc-900 text-lg border-b border-zinc-50 pb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      Requisitos de Archivos (Pre-prensa)
                    </h4>
                    <ul className="text-zinc-600 font-medium space-y-4 pt-2">
                      <li className="flex items-start gap-3">
                        <span className="text-amber-500 mt-1">•</span>
                        <span>Debe ser en editable: <strong>Illustrator, Corel Draw, o Photoshop</strong>.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-amber-500 mt-1">•</span>
                        <span>Con los textos en <strong>curvas</strong>.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-amber-500 mt-1">•</span>
                        <span>Y si no está en curvas enviar el adjunto de la <strong>font</strong>.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-amber-500 mt-1">•</span>
                        <span>Y de no tener el arte, envíe una imagen de referencia para cotizar <strong>cuánto vale la reconstrucción</strong>.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-6 pt-4 px-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-zinc-700" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900">Ubicación</h4>
                        <p className="text-zinc-500 font-medium text-sm mt-0.5">Valencia Carabobo, Urb. Bello Monte</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-zinc-700" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900">Correo</h4>
                        <a href="mailto:disenamecorporation@gmail.com" className="text-zinc-500 font-medium text-sm mt-0.5 hover:text-amber-500 transition-colors">disenamecorporation@gmail.com</a>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-zinc-700" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900">Teléfono</h4>
                        <a href="https://wa.me/584145915757" className="text-zinc-500 font-medium text-sm mt-0.5 hover:text-amber-500 transition-colors">0414 591 5757</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Real Glass Form */}
              <div className="bg-white border border-zinc-200/60 p-8 sm:p-10 rounded-[2.5rem] shadow-xl relative group">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const service = formData.get('service');
                    const date = formData.get('date');
                    const priority = formData.get('priority');
                    const quantity = formData.get('quantity');
                    const location = formData.get('location');
                    const email = formData.get('email');
                    const phone = formData.get('phone');
                    const message = formData.get('message');

                    const text = `Hola, quiero cotizar un proyecto.\n\n` +
                      `*Servicio:* ${service}\n` +
                      `*Cantidad:* ${quantity}\n` +
                      `*Para cuándo lo quiere:* ${date}\n` +
                      `*Disposición a pagar prioridad:* ${priority}\n` +
                      `*De dónde escribe:* ${location}\n` +
                      `*Correo:* ${email}\n` +
                      `*Teléfono:* ${phone}\n\n` +
                      `*Archivos adjuntos (Links):* ${message}`;

                    window.open(`https://wa.me/584145915757?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">¿Qué servicio requiere?</label>
                    <select name="service" defaultValue="" required className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-zinc-900 font-medium outline-none appearance-none">
                      <option value="" disabled>Selecciona un servicio</option>
                      <option value="Gigantografía">Gigantografía</option>
                      <option value="Impresión 3D">Impresión 3D</option>
                      <option value="Grabado Láser">Grabado Láser</option>
                      <option value="Diseño Gráfico / Branding">Diseño Gráfico / Branding</option>
                      <option value="Empaques Flexibles">Empaques Flexibles</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">¿Para cuándo lo quiere?</label>
                      <input type="date" name="date" required className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-zinc-900 font-medium outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">¿Qué cantidad requiere?</label>
                      <input type="text" name="quantity" required placeholder="Ej: 100 unidades" className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-zinc-900 font-medium placeholder:text-zinc-400 outline-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">¿Prioridad Urgente?</label>
                    <select name="priority" defaultValue="" required className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-zinc-900 font-medium outline-none appearance-none">
                      <option value="" disabled>¿Está dispuesto a pagar por priorizar?</option>
                      <option value="Sí, dispuesto a pagar extra">Sí, dispuesto a pagar extra por urgencia</option>
                      <option value="No, tiempo estándar">No, tiempo de entrega estándar</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">¿De dónde nos escribe?</label>
                      <input type="text" name="location" required placeholder="Ciudad, País" className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-zinc-900 font-medium placeholder:text-zinc-400 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">Teléfono</label>
                      <input type="tel" name="phone" required placeholder="Tu teléfono" className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-zinc-900 font-medium placeholder:text-zinc-400 outline-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">Correo</label>
                    <input type="email" name="email" required placeholder="tu@correo.com" className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-zinc-900 font-medium placeholder:text-zinc-400 outline-none" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 ml-1 uppercase tracking-wider">Adjuntar Archivo / Enlace</label>
                    <textarea name="message" rows={3} required placeholder="Pega el link (Google Drive, WeTransfer, etc.) de tus archivos, o la imagen de referencia para reconstrucción." className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all text-zinc-900 font-medium placeholder:text-zinc-400 resize-none outline-none"></textarea>
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="w-full relative overflow-hidden bg-zinc-900 text-white rounded-2xl px-6 py-4.5 font-semibold hover:bg-black transition-all group/btn flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] hover:-translate-y-1">
                      <span className="relative z-10 flex items-center gap-2 text-[15px]">
                        Enviar Cotización a WhatsApp
                        <Send className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 text-amber-400" />
                      </span>
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-32 px-4 sm:px-8 bg-zinc-900 relative overflow-hidden flex items-center justify-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-gradient-to-tr from-cyan-500/10 to-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <h2 className="text-5xl sm:text-7xl font-bold tracking-tight text-white leading-[1.05]">
            ¿Listo para llevar tu marca al siguiente nivel?
          </h2>
          <p className="text-xl text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed">
            Hablemos sobre tu próximo proyecto de diseño, impresión o grabado.
          </p>

          <div className="flex items-center justify-center pt-8">
            <a
              href="https://wa.me/584145915757?text=Hola,%20quiero%20realizar%20mi%20tarjeta%20o%20proyecto."
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-5 rounded-full bg-white text-zinc-900 font-semibold text-base hover:bg-zinc-100 transition-all shadow-[0_10px_40px_-10px_rgba(255,255,255,0.2)] hover:-translate-y-1 flex items-center gap-2 group"
            >
              <span>Realizar mi tarjeta</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
