import React, { useState, useRef } from 'react';
import { BusinessCardForm, TabType } from '../types';
import { Sparkles, Phone, CheckCircle2, RotateCw, Image as ImageIcon, ShieldCheck, Ruler, HelpCircle, Mail, Award, FileText } from 'lucide-react';

interface CardQuoteViewProps {
  setActiveTab: (tab: TabType) => void;
}

export const CardQuoteView: React.FC<CardQuoteViewProps> = ({ setActiveTab }) => {
  const [form, setForm] = useState<BusinessCardForm>({
    fullName: '',
    phone: '',
    email: '',
    quantity: 1000,
    finish: 'mate',
    frontUrl: '',
    backUrl: '',
    comments: ''
  });

  const [isFlipped, setIsFlipped] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Calculate rotation limits
    setRotation({
      x: (-y / (rect.height / 2)) * 12,
      y: (x / (rect.width / 2)) * 12
    });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value
    }));
  };

  const isFormValid = form.fullName.trim() !== '' && form.phone.trim() !== '' && form.email.trim() !== '';

  const handleWhatsAppSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const message = `*SOLICITUD DE TARJETA DE FIDELIDAD - PUNTOS DESIGN*%0A%0A` +
      `*Cliente:* ${encodeURIComponent(form.fullName)}%0A` +
      `*Teléfono:* ${encodeURIComponent(form.phone)}%0A` +
      `*Email:* ${encodeURIComponent(form.email)}%0A` +
      (form.frontUrl ? `*URL Frente:* ${encodeURIComponent(form.frontUrl)}%0A` : '') +
      (form.backUrl ? `*URL Reverso:* ${encodeURIComponent(form.backUrl)}%0A` : '') +
      (form.comments ? `*Comentarios:* ${encodeURIComponent(form.comments)}%0A` : '') +
      `%0A_Enviado desde Design Store Venezuela_`;

    const whatsappNumber = "584145915757"; // Reemplazar con el número real de WhatsApp de la empresa
    const url = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen pt-36 sm:pt-40 md:pt-44 pb-20 px-4 sm:px-8 bg-zinc-50/50">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-zinc-200 text-xs font-bold uppercase tracking-wider text-zinc-800 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Configurador 3D Interactivo • Tarjeta de Fidelidad</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900">
            Tarjeta de Fidelidad
          </h1>
          <p className="text-zinc-600 text-base sm:text-lg">
            Personaliza el diseño de tu Tarjeta de Fidelidad física en 3D, conoce nuestro sistema automatizado de puntos y solicita tu membresía directamente por WhatsApp.
          </p>
        </div>

        {/* 3D Card Preview Stage */}
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative w-full max-w-xl flex flex-col items-center">
            
            {/* Dimension guides / Cotas */}
            <div className="w-[336px] max-w-full flex items-center justify-between text-xs font-mono text-zinc-500 pb-2 px-1 select-none">
              <span className="flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5 text-amber-500" />
                336px (3.5 in)
              </span>
              <span className="text-[11px] bg-zinc-200/70 px-2 py-0.5 rounded text-zinc-700 font-semibold">
                Medida Estándar 96 DPI
              </span>
            </div>

            <div className="flex items-center gap-3 w-full justify-center">
              {/* Left height cota */}
              <div className="hidden sm:flex flex-col items-center justify-center text-xs font-mono text-zinc-500 h-[192px] py-2">
                <span className="rotate-[-90deg] whitespace-nowrap">192px (2 in)</span>
              </div>

              {/* 3D Card Container */}
              <div 
                className="perspective-1000 w-full max-w-[336px] h-[192px] cursor-pointer group"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div 
                  ref={cardRef}
                  className="w-full h-full relative transform-style-3d transition-transform duration-200 ease-out shadow-2xl rounded-2xl"
                  style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) ${isFlipped ? 'rotateY(180deg)' : ''}`
                  }}
                >
                  {/* Front Side */}
                  <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl glass-panel border border-zinc-300/80 overflow-hidden bg-white shadow-xl flex flex-col justify-between p-6">
                    {form.frontUrl ? (
                      <div className="absolute inset-0 z-0">
                        <img 
                          src={form.frontUrl} 
                          alt="Frente de tarjeta personalizado" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/10"></div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black text-white p-6 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center p-1.5 backdrop-blur-md">
                            <img src="https://i.postimg.cc/sfSLbNKq/designisotipo.png" alt="Logo" className="w-full h-full object-contain filter invert" />
                          </div>
                          <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono">Frente</span>
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg text-white leading-tight">{form.fullName || 'Tu Nombre y Apellido'}</h3>
                          <p className="text-xs text-zinc-400">Cargo / Especialidad</p>
                        </div>
                        <div className="text-[11px] text-zinc-300 font-mono flex items-center justify-between pt-2 border-t border-white/10">
                          <span>{form.phone || '+58 412 0000000'}</span>
                          <span>{form.email || 'correo@empresa.com'}</span>
                        </div>
                      </div>
                    )}

                    {/* Overlay badge */}
                    <div className="relative z-10 flex justify-between items-start pointer-events-none">
                      {form.frontUrl && (
                        <span className="bg-black/70 text-white text-[10px] font-mono px-2.5 py-1 rounded-full backdrop-blur-md">
                          Frente Personalizado
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Back Side */}
                  <div 
                    className="absolute inset-0 w-full h-full backface-hidden rounded-2xl glass-panel border border-zinc-300/80 overflow-hidden bg-white shadow-xl flex flex-col justify-between p-6"
                    style={{ transform: 'rotateY(180deg)' }}
                  >
                    {form.backUrl ? (
                      <div className="absolute inset-0 z-0">
                        <img 
                          src={form.backUrl} 
                          alt="Reverso de tarjeta personalizado" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/10"></div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-white to-zinc-200 text-zinc-900 p-6 flex flex-col justify-between items-center text-center">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono self-start">Reverso</span>
                        <div className="space-y-2">
                          <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center p-2 mx-auto shadow-md">
                            <img src="https://i.postimg.cc/sfSLbNKq/designisotipo.png" alt="Logo" className="w-full h-full object-contain filter invert" />
                          </div>
                          <p className="text-xs font-semibold text-zinc-800">Design Store Venezuela</p>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono">www.designstorevzla.com</p>
                      </div>
                    )}

                    <div className="relative z-10 flex justify-between items-start pointer-events-none">
                      {form.backUrl && (
                        <span className="bg-black/70 text-white text-[10px] font-mono px-2.5 py-1 rounded-full backdrop-blur-md">
                          Reverso Personalizado
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Right height cota */}
              <div className="hidden sm:flex flex-col items-center justify-center text-xs font-mono text-zinc-500 h-[192px] py-2">
                <span className="rotate-90 whitespace-nowrap">192px (2 in)</span>
              </div>
            </div>

            {/* Flip action hint */}
            <button 
              onClick={() => setIsFlipped(!isFlipped)}
              className="mt-4 inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full glass-panel border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors shadow-sm"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Girar Tarjeta ({isFlipped ? 'Mostrando Reverso' : 'Mostrando Frente'})</span>
            </button>
          </div>
        </div>

        {/* Loyalty Program & Automation Rules Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-zinc-200 shadow-md max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
            <div className="p-2 bg-amber-50 rounded-xl">
              <Award className="w-6 h-6 text-amber-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Programa de Fidelidad & Automatización</h2>
              <p className="text-xs text-zinc-500">Reglas esenciales para la acumulación e identificación de tus Puntos Design</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900">1. Acumula Puntos</h4>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Por cada compra que realices de nuestros servicios de impresión y diseño, acumularás **Puntos Design** automáticamente.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900">2. Identificación por Correo</h4>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                El correo electrónico que proporciones al solicitar este servicio **debe ser el mismo registrado en tu cuenta de Design Store** para identificarte y sincronizar tus puntos.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900">3. Emisión 100% Gratis</h4>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Solicitar y emitir tu **Tarjeta de Fidelidad es 100% gratuito** (no consume tus puntos acumulados ni tiene costo de dinero).
              </p>
            </div>
          </div>

          <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/50 flex gap-3 items-start text-xs text-zinc-700 leading-relaxed">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-amber-800">Nota de Identificación:</strong> Nos aseguramos de mantener tu cuenta segura. La sincronización es automática gracias a tu correo electrónico de cliente de Design Store.
            </div>
          </div>
        </div>

        {/* Request Form Section */}
        <div className="glass-card rounded-3xl p-6 sm:p-12 border border-zinc-200 shadow-xl max-w-4xl mx-auto">
          <form 
            onSubmit={handleWhatsAppSend} 
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
                e.preventDefault();
              }
            }} 
            className="space-y-8"
          >
            <div className="border-b border-zinc-200 pb-4">
              <h2 className="text-xl font-bold text-zinc-900">Formulario de Solicitud</h2>
              <p className="text-xs text-zinc-500">Complete sus datos y configure sus preferencias de puntos para su Tarjeta de Fidelidad.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="fullName"
                  required
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Ej. Roberto Sánchez"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black text-sm text-zinc-900 transition-all"
                />
              </div>

              {/* Phone / WhatsApp */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Teléfono / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Ej. +58 412 1234567"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black text-sm text-zinc-900 transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black text-sm text-zinc-900 transition-all"
                />
              </div>

              {/* Front URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
                  URL de Imagen (Frente)
                </label>
                <input 
                  type="url" 
                  name="frontUrl"
                  value={form.frontUrl}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/frente.jpg"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black text-sm text-zinc-900 transition-all"
                />
              </div>

              {/* Back URL */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
                  URL de Imagen (Reverso)
                </label>
                <input 
                  type="url" 
                  name="backUrl"
                  value={form.backUrl}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/reverso.jpg"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black text-sm text-zinc-900 transition-all"
                />
              </div>

              {/* How to upload images tutorial button */}
              <div className="md:col-span-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab('tutorial-imagenes'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 text-white font-semibold text-xs hover:bg-zinc-800 transition-all shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-amber-400 transition-transform group-hover:scale-110" />
                  <span>¿Cómo subir mis imágenes?</span>
                </button>
              </div>

              {/* Comments */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Comentarios Adicionales o Instrucciones de Troquelado
                </label>
                <textarea 
                  name="comments"
                  rows={3}
                  value={form.comments}
                  onChange={handleChange}
                  placeholder="Ej. Requiere esquinas redondeadas y detalles con foil dorado..."
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black text-sm text-zinc-900 transition-all resize-none"
                ></textarea>
              </div>

            </div>

            {/* Validation Notice & WhatsApp Button */}
            <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-zinc-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Sus datos están seguros. La solicitud se abrirá directamente en WhatsApp.</span>
              </div>

              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-xl ${
                  isFormValid
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer'
                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>Enviar solicitud por WhatsApp</span>
              </button>
            </div>

            {!isFormValid && (
              <p className="text-center text-xs text-amber-600 font-medium">
                * Por favor complete Nombre, Teléfono y Email para habilitar el envío por WhatsApp.
              </p>
            )}

          </form>
        </div>

      </div>
    </div>
  );
};
