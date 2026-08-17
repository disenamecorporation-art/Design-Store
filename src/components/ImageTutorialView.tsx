import React from 'react';
import { TabType } from '../types';
import { ArrowLeft, ExternalLink, Image, Copy, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';

interface ImageTutorialViewProps {
  setActiveTab: (tab: TabType) => void;
}

export const ImageTutorialView: React.FC<ImageTutorialViewProps> = ({ setActiveTab }) => {
  return (
    <div className="min-h-screen pt-12 pb-24 px-4 sm:px-8 bg-[#fbfbfd] text-zinc-900 font-['Montserrat']">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Back Button */}
        <div>
          <button
            onClick={() => setActiveTab('cotizar')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-zinc-800 border border-zinc-200 hover:bg-zinc-100 font-light text-xs transition-all shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Volver al Cotizador</span>
          </button>
        </div>

        {/* Header Card */}
        <div className="backdrop-blur-2xl bg-white/90 rounded-[36px] p-8 sm:p-12 border border-zinc-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] space-y-4 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-400/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="w-16 h-16 rounded-3xl bg-black text-white flex items-center justify-center mx-auto shadow-xl">
            <Image className="w-8 h-8 text-amber-400" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-zinc-900 pt-4">
            ¿Cómo subir tus imágenes a postimages.org y usarlas?
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-light">
            Sigue este sencillo tutorial para alojar tus diseños de tarjetas de presentación en internet y pegarlos en el configurador 3D interactivo.
          </p>

          <div className="pt-2">
            <a
              href="https://postimages.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-black text-white font-light text-sm hover:bg-zinc-800 transition-all shadow-lg hover:scale-105"
            >
              <span>Ir a postimages.org</span>
              <ExternalLink className="w-4 h-4 text-amber-400" />
            </a>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="backdrop-blur-xl bg-white/90 rounded-3xl p-8 border border-zinc-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 font-light flex items-center justify-center text-lg">
                1
              </div>
              <h3 className="text-lg font-light text-zinc-900 font-semibold">Sube tu imagen</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light">
                Entra a <strong className="text-zinc-900 font-medium">postimages.org</strong>, haz clic en <span className="bg-zinc-100 px-2 py-0.5 rounded font-medium text-zinc-800">"Elige las imágenes"</span> o arrastra tu archivo JPG/PNG del frente o reverso de tu tarjeta.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-100 text-[11px] text-zinc-500 flex items-center gap-1.5 font-light">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Soporta alta resolución (96 DPI o superior)</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="backdrop-blur-xl bg-white/90 rounded-3xl p-8 border border-zinc-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 font-light flex items-center justify-center text-lg">
                2
              </div>
              <h3 className="text-lg font-light text-zinc-900 font-semibold">Copia el Enlace Directo</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light">
                Una vez cargada la imagen, copia el campo titulado <strong className="text-zinc-900 font-medium">"Enlace directo"</strong> (URL que termina en <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono text-zinc-800">.jpg</code> o <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono text-zinc-800">.png</code>).
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-100 text-[11px] text-zinc-500 flex items-center gap-1.5 font-light">
              <Copy className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Evita copiar enlaces de visualización web genéricos</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="backdrop-blur-xl bg-white/90 rounded-3xl p-8 border border-zinc-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 font-light flex items-center justify-center text-lg">
                3
              </div>
              <h3 className="text-lg font-light text-zinc-900 font-semibold">Pega en el Formulario</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light">
                Regresa al cotizador de Design Store Venezuela y pega el enlace en el campo <strong className="text-zinc-900 font-medium">"URL de Imagen (Frente)"</strong> o <strong className="text-zinc-900 font-medium">"Reverso"</strong>. ¡El 3D se actualizará al instante!
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-100 text-[11px] text-zinc-500 flex items-center gap-1.5 font-light">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Visualización 3D interactiva en tiempo real</span>
            </div>
          </div>

        </div>

        {/* Bottom CTA to return */}
        <div className="text-center pt-6">
          <button
            onClick={() => { setActiveTab('cotizar'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="px-8 py-4 rounded-full bg-black text-white font-light text-sm hover:bg-zinc-800 transition-all shadow-xl hover:scale-105"
          >
            ¡Entendido, ir al Cotizador de Tarjetas!
          </button>
        </div>

      </div>
    </div>
  );
};
