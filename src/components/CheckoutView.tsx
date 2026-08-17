import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
import { TabType } from '../types';

interface CheckoutViewProps {
  setActiveTab: (tab: TabType) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ setActiveTab }) => {
  const { items, cartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', city: '', zip: '' });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Generate an 8-digit random numeric code
    const uniqueCode = Math.floor(10000000 + Math.random() * 90000000).toString();
    
    // Prepare WhatsApp message
    
    const itemsList = items.map(i => `- ${i.quantity}x ${i.product.name} (${(i.product.price * i.quantity).toFixed(2)})`).join('\n');
    const message = `Este es tu CODIGO NUMERICO DE IDENTIFICACIÓN DE SERVICIO *${uniqueCode}*

*DATOS DEL CLIENTE*
Nombre: ${formData.name}
Email: ${formData.email}
Teléfono: ${formData.phone}

*DIRECCIÓN DE ENVÍO*
Dirección: ${formData.address}
Ciudad: ${formData.city}
Código Postal: ${formData.zip}

*RESUMEN DEL PEDIDO*
${itemsList}

*Total:* ${cartTotal.toFixed(2)}`;

    const whatsappUrl = `https://wa.me/584145915757?text=${encodeURIComponent(message)}`;

    // Simulate process
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      clearCart();
      window.open(whatsappUrl, '_blank');
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-12 pb-20 px-4 flex items-center justify-center bg-[#fbfbfd]">
        <div className="bg-white p-10 sm:p-16 rounded-[3rem] shadow-xl border border-zinc-200 max-w-lg w-full text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight">¡Orden Confirmada!</h2>
          <p className="text-lg text-zinc-500 font-medium">Hemos recibido tu pedido. Pronto nos pondremos en contacto contigo con los detalles.</p>
          <button 
            onClick={() => setActiveTab('store')}
            className="mt-8 px-8 py-4 bg-black text-white rounded-full font-bold text-lg hover:bg-zinc-800 transition-all shadow-lg hover:-translate-y-1"
          >
            Volver a la Tienda
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-12 pb-20 px-4 flex items-center justify-center bg-[#fbfbfd]">
        <div className="text-center">
          <p className="text-xl text-zinc-500 font-medium mb-6">Tu carrito está vacío.</p>
          <button 
            onClick={() => setActiveTab('store')}
            className="px-8 py-4 bg-black text-white rounded-full font-bold text-lg hover:bg-zinc-800 transition-all"
          >
            Ir a la Tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12 pb-24 px-4 sm:px-8 bg-[#fbfbfd] font-['Manrope',sans-serif]">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => setActiveTab('store')}
          className="mb-8 inline-flex items-center gap-2 text-zinc-500 hover:text-black font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a la tienda
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Checkout Form */}
          <div className="flex-1 space-y-10">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight mb-2">Checkout</h1>
              <p className="text-lg text-zinc-500 font-medium">Completa tus datos para finalizar la compra.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-sm border border-zinc-200 space-y-8">
              
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-zinc-900">Información de Contacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Nombre Completo</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all" placeholder="Ej. Juan Pérez" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Correo Electrónico</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all" placeholder="juan@ejemplo.com" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Teléfono</label>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all" placeholder="+58 412 000 0000" />
                  </div>
                </div>
              </div>

              <hr className="border-zinc-100" />

              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-zinc-900">Dirección de Envío</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Dirección Detallada</label>
                    <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all" placeholder="Calle, Avenida, Edificio, Apartamento..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Ciudad</label>
                      <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all" placeholder="Ej. Caracas" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Código Postal</label>
                      <input required type="text" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all" placeholder="Ej. 1010" />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full py-5 bg-black text-white font-bold text-lg rounded-2xl hover:bg-zinc-800 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex items-center justify-center gap-2 hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isProcessing ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:w-[400px] shrink-0">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-zinc-200 lg:sticky lg:top-48 space-y-8">
              <h3 className="text-2xl font-bold text-zinc-900">Resumen</h3>
              
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.product.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl bg-zinc-100 overflow-hidden shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-zinc-900 line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-zinc-500">Cant: {item.quantity}</p>
                    </div>
                    <span className="font-extrabold text-zinc-900">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <hr className="border-zinc-100" />
              
              <div className="space-y-3">
                <div className="flex justify-between text-zinc-500 font-medium">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 font-medium">
                  <span>Envío</span>
                  <span>Calculado luego</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                  <span className="text-xl font-bold text-zinc-900">Total</span>
                  <span className="text-3xl font-extrabold text-zinc-900">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-zinc-50 p-4 rounded-2xl flex items-center gap-3 border border-zinc-100">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                <p className="text-xs text-zinc-500 font-medium">Tus datos están protegidos y la compra es 100% segura.</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
