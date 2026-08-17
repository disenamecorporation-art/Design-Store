import React, { useState, useEffect } from 'react';
import { PortfolioProject, TabType } from '../types';
import { getPortfolioProjects } from '../data/portfolioStore';
import { 
  Star, 
  Play, 
  Image as ImageIcon, 
  Video, 
  Quote, 
  ExternalLink, 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  UserCheck, 
  MessageSquare,
  Phone,
  Layers,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PortfolioViewProps {
  setActiveTab: (tab: TabType) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({ setActiveTab }) => {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  
  // Modal gallery state
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0); // 0 = main img, 1 = img2, 2 = img3, 3 = video

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const data = await getPortfolioProjects();
    setProjects(data);
    setLoading(false);
  };

  const categories = ['Todos', ...Array.from(new Set(projects.map(p => p.category)))];

  const filteredProjects = selectedCategory === 'Todos'
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  const openProjectModal = (project: PortfolioProject) => {
    setSelectedProject(project);
    setActiveMediaIndex(0);
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
  };

  // Utility to parse YouTube / Video embed URLs safely
  const getVideoEmbedUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (url.includes('vimeo.com/')) {
      const id = url.split('vimeo.com/')[1];
      return `https://player.vimeo.com/video/${id}`;
    }
    return url; // fallback direct link or embed
  };

  const getMediaCount = (p: PortfolioProject) => {
    let count = 1;
    if (p.imageUrl2) count++;
    if (p.imageUrl3) count++;
    return count;
  };

  return (
    <div className="min-h-screen pt-12 pb-24 px-4 sm:px-8 bg-[#fbfbfd]">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Casos de Éxito & Trabajos Realizados</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-zinc-900 tracking-tight leading-[1.1]">
            Portafolio de Servicios
          </h1>
          <p className="text-lg text-zinc-600 font-medium leading-relaxed">
            Explora nuestros proyectos de impresión en gran formato, grabado láser, acrílicos corpóreos y empaques de lujo realizados para marcas líderes en Venezuela.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 pt-2 no-scrollbar">
          <div className="flex items-center gap-2 bg-white/80 p-1.5 rounded-2xl border border-zinc-200/80 shadow-sm backdrop-blur-md">
            <div className="px-3 py-1.5 text-zinc-400 font-bold text-xs flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Categoría:</span>
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-xl text-xs font-extrabold tracking-tight transition-all duration-300 whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-black text-white shadow-md scale-[1.02]'
                    : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Slider Section */}
        {loading ? (
          <div className="flex items-center gap-6 overflow-hidden py-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="w-80 h-64 bg-zinc-200 rounded-3xl animate-pulse shrink-0"></div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200 max-w-md mx-auto space-y-4">
            <Layers className="w-12 h-12 text-zinc-300 mx-auto" />
            <h3 className="text-xl font-extrabold text-zinc-900">No hay proyectos en esta categoría</h3>
            <p className="text-sm text-zinc-500 font-medium">Prueba seleccionando otra categoría o restablece el filtro.</p>
            <button
              onClick={() => setSelectedCategory('Todos')}
              className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl shadow-md"
            >
              Ver Todos los Proyectos
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Ticker Banner Note */}
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 px-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>Slider Interactivo • Pasa el cursor o toca para pausar • Haz clic para ver detalles</span>
              </span>
              <span className="hidden sm:inline-block bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-lg">
                {filteredProjects.length} {filteredProjects.length === 1 ? 'Proyecto' : 'Proyectos'}
              </span>
            </div>

            {/* Continuous Marquee Slider Row 1 */}
            <div className="relative overflow-hidden w-full py-4 bg-gradient-to-r from-[#fbfbfd] via-transparent to-[#fbfbfd] group">
              
              {/* Fade Edges */}
              <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#fbfbfd] to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#fbfbfd] to-transparent z-10 pointer-events-none"></div>

              <div className="animate-marquee gap-6 flex items-center">
                {[...filteredProjects, ...filteredProjects, ...filteredProjects].map((project, idx) => (
                  <div
                    key={`${project.id}-m1-${idx}`}
                    onClick={() => openProjectModal(project)}
                    className="w-72 sm:w-88 group/card bg-white rounded-3xl border border-zinc-200/90 shadow-md hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden shrink-0 flex flex-col relative"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                      {/* Category Badge & Rating */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-zinc-900 text-[10px] font-black uppercase tracking-wider shadow-sm">
                          {project.category}
                        </span>
                        
                        <div className="flex items-center gap-1 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[11px] font-black shadow-md">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{project.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Click overlay hint */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-4 py-2 bg-white text-black text-xs font-black rounded-full shadow-lg transform translate-y-2 group-hover/card:translate-y-0 transition-transform flex items-center gap-1.5">
                          <span>Ver Proyecto</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                    {/* ONLY Title and Client Name Header - NO Dense Text */}
                    <div className="p-5 bg-white space-y-1">
                      <h3 className="text-base font-extrabold text-zinc-900 line-clamp-1 group-hover/card:text-indigo-600 transition-colors">
                        {project.title}
                      </h3>
                      {project.clientName && (
                        <p className="text-xs font-bold text-zinc-400 truncate">
                          {project.clientName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continuous Marquee Slider Row 2 (Reverse direction for dynamic logo reel effect if multiple projects) */}
            {filteredProjects.length > 1 && (
              <div className="relative overflow-hidden w-full py-2 group">
                <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#fbfbfd] to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#fbfbfd] to-transparent z-10 pointer-events-none"></div>

                <div className="animate-marquee-reverse gap-6 flex items-center">
                  {[...filteredProjects, ...filteredProjects, ...filteredProjects].reverse().map((project, idx) => (
                    <div
                      key={`${project.id}-m2-${idx}`}
                      onClick={() => openProjectModal(project)}
                      className="w-64 sm:w-80 group/card bg-white rounded-3xl border border-zinc-200/90 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden shrink-0 flex flex-col relative"
                    >
                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-zinc-900 text-[10px] font-black uppercase tracking-wider">
                            {project.category}
                          </span>
                        </div>

                        {/* Click overlay hint */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-3.5 py-1.5 bg-white text-black text-xs font-black rounded-full shadow-lg">
                            Ver Detalles
                          </span>
                        </div>
                      </div>

                      {/* ONLY Title */}
                      <div className="p-4 bg-white">
                        <h3 className="text-sm font-extrabold text-zinc-900 line-clamp-1 group-hover/card:text-indigo-600 transition-colors">
                          {project.title}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Call to Action banner */}
            <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
              <div className="space-y-1">
                <h3 className="text-xl font-black">¿Deseas realizar un proyecto similar para tu marca?</h3>
                <p className="text-xs font-medium text-amber-100">
                  Cotiza directamente con nuestros asesores en impresión y rotulación corpórea.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('cotizar')}
                className="px-6 py-3 bg-white text-black font-extrabold text-xs rounded-2xl shadow-md hover:bg-zinc-100 transition-all shrink-0 hover:scale-105"
              >
                Ir al Cotizador General
              </button>
            </div>

          </div>
        )}

      </div>

      {/* PROJECT POP-UP MODAL (Product View Style) */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 relative my-auto flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={closeProjectModal}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-zinc-900/80 hover:bg-black text-white flex items-center justify-center transition-all shadow-lg hover:scale-110 focus:outline-none"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
                
                {/* Left Column: Media Gallery & Video */}
                <div className="md:col-span-7 p-6 space-y-4 bg-zinc-50/50 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Main Display Area */}
                    <div className="relative aspect-[16/11] rounded-2xl overflow-hidden bg-black shadow-inner border border-zinc-200">
                      {activeMediaIndex === 3 && selectedProject.videoUrl ? (
                        <iframe
                          src={getVideoEmbedUrl(selectedProject.videoUrl) || ''}
                          title={selectedProject.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <img
                          src={
                            activeMediaIndex === 1 && selectedProject.imageUrl2
                              ? selectedProject.imageUrl2
                              : activeMediaIndex === 2 && selectedProject.imageUrl3
                              ? selectedProject.imageUrl3
                              : selectedProject.imageUrl
                          }
                          alt={selectedProject.title}
                          className="w-full h-full object-cover transition-all duration-300"
                        />
                      )}

                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                        {activeMediaIndex === 3 ? 'Video Demo' : `Foto ${activeMediaIndex + 1}`}
                      </span>
                    </div>

                    {/* Media Selector Thumbnails */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-1">
                      {/* Thumbnail 1 */}
                      <button
                        onClick={() => setActiveMediaIndex(0)}
                        className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                          activeMediaIndex === 0 ? 'border-black ring-2 ring-black/20 scale-105' : 'border-zinc-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={selectedProject.imageUrl} alt="Foto 1" className="w-full h-full object-cover" />
                      </button>

                      {/* Thumbnail 2 */}
                      {selectedProject.imageUrl2 && (
                        <button
                          onClick={() => setActiveMediaIndex(1)}
                          className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                            activeMediaIndex === 1 ? 'border-black ring-2 ring-black/20 scale-105' : 'border-zinc-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={selectedProject.imageUrl2} alt="Foto 2" className="w-full h-full object-cover" />
                        </button>
                      )}

                      {/* Thumbnail 3 */}
                      {selectedProject.imageUrl3 && (
                        <button
                          onClick={() => setActiveMediaIndex(2)}
                          className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                            activeMediaIndex === 2 ? 'border-black ring-2 ring-black/20 scale-105' : 'border-zinc-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={selectedProject.imageUrl3} alt="Foto 3" className="w-full h-full object-cover" />
                        </button>
                      )}

                      {/* Video Thumbnail Button */}
                      {selectedProject.videoUrl && (
                        <button
                          onClick={() => setActiveMediaIndex(3)}
                          className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-rose-900 text-white flex flex-col items-center justify-center ${
                            activeMediaIndex === 3 ? 'border-rose-600 ring-2 ring-rose-500/30 scale-105' : 'border-zinc-200 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <Play className="w-5 h-5 fill-current" />
                          <span className="text-[9px] font-black uppercase mt-0.5">Video</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Rating Header */}
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= selectedProject.rating ? 'fill-current' : 'text-zinc-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-black text-amber-900">
                        {selectedProject.rating.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg">
                      Calificación Verificada
                    </span>
                  </div>
                </div>

                {/* Right Column: Information & Testimonial */}
                <div className="md:col-span-5 p-6 space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Header Details */}
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                        {selectedProject.category}
                      </span>
                      <h2 className="text-2xl font-black text-zinc-900 leading-tight mt-2">
                        {selectedProject.title}
                      </h2>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-zinc-500 border-y border-zinc-100 py-3">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-zinc-800" />
                        <span>Cliente: <strong className="text-zinc-900">{selectedProject.clientName || 'Confidencial'}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-zinc-800" />
                        <span>Fecha: <strong className="text-zinc-900">{selectedProject.projectDate || '2026'}</strong></span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider">Descripción del Trabajo</h4>
                      <p className="text-sm text-zinc-700 font-medium leading-relaxed">
                        {selectedProject.description}
                      </p>
                    </div>

                    {/* Testimonial / Review Section */}
                    {selectedProject.reviewText && (
                      <div className="p-4 rounded-2xl bg-zinc-900 text-white space-y-3 relative overflow-hidden shadow-md">
                        <Quote className="absolute top-2 right-2 w-12 h-12 text-zinc-800/60 pointer-events-none" />
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-black uppercase text-amber-400 tracking-wider">Reseña del Cliente</span>
                        </div>
                        <p className="text-sm font-medium italic leading-relaxed text-zinc-200">
                          "{selectedProject.reviewText}"
                        </p>
                        {selectedProject.reviewerName && (
                          <div className="text-xs font-extrabold text-zinc-400 border-t border-zinc-800 pt-2">
                            — {selectedProject.reviewerName}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions / CTA */}
                  <div className="space-y-3 pt-4 border-t border-zinc-100">
                    <a
                      href={`https://wa.me/584145915757?text=Hola,%20me%20interesa%20un%20proyecto%20similar%20a:%20${encodeURIComponent(selectedProject.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Cotizar Proyecto Similar por WhatsApp</span>
                    </a>

                    <button
                      onClick={() => {
                        closeProjectModal();
                        setActiveTab('cotizar');
                      }}
                      className="w-full py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <span>Ir al Cotizador General</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
