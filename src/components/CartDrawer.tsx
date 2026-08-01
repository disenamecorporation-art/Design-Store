import React from 'react';
import { useCart } from '../hooks/useCart';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { TabType } from '../types';

interface CartDrawerProps {
  setActiveTab: (tab: TabType) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ setActiveTab }) => {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-['Manrope',sans-serif]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="px-6 py-6 border-b border-zinc-100 flex items-center justify-between bg-white">
          <h2 className="text-2xl font-extrabold text-zinc-900 flex items-center gap-3">
            <ShoppingBag className="w-6 h-6" />
            Tu Carrito
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4">
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <p className="font-medium text-lg text-zinc-500">Tu carrito está vacío.</p>
              <button 
                onClick={() => { setIsCartOpen(false); setActiveTab('store'); }}
                className="px-6 py-3 bg-black text-white rounded-full font-bold text-sm mt-4 hover:bg-zinc-800 transition-colors"
              >
                Explorar Tienda
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product.id} className="flex gap-4">
                <div className="w-24 h-24 rounded-2xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200/50">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-zinc-900 leading-tight line-clamp-2">{item.product.name}</h3>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-zinc-400 hover:text-red-500 transition-colors -mt-1 -mr-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-zinc-500 font-semibold mt-1">${item.product.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-3 py-1.5 text-zinc-500 hover:text-black hover:bg-zinc-200 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-zinc-900">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-3 py-1.5 text-zinc-500 hover:text-black hover:bg-zinc-200 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-zinc-100 p-6 bg-zinc-50">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-medium text-zinc-500">Subtotal</span>
              <span className="text-2xl font-extrabold text-zinc-900">${cartTotal.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={() => {
                setIsCartOpen(false);
                setActiveTab('checkout');
              }}
              className="w-full py-5 bg-black text-white rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex items-center justify-center gap-3 hover:-translate-y-1"
            >
              Proceder al Pago
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
};
