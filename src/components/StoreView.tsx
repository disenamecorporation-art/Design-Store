import React, { useState } from 'react';
import { products, storeCategories } from '../data/products';
import { useCart } from '../hooks/useCart';
import { ShoppingBag, Filter, ArrowRight, Star } from 'lucide-react';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';

export const StoreView: React.FC = () => {
  const { addToCart, setIsCartOpen } = useCart();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const filteredProducts = activeCategory === 'Todos' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  return (
    <div className="min-h-screen pt-40 md:pt-48 pb-24 px-4 sm:px-8 bg-zinc-50 font-['Manrope',sans-serif]">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-zinc-900 leading-[1.05]">
            Nuestra Tienda. <br/> <span className="text-zinc-400">Excelencia impresa.</span>
          </h1>
          <p className="text-xl text-zinc-500 font-medium leading-relaxed">
            Explora nuestro catálogo de productos diseñados para elevar la imagen de tu marca al siguiente nivel, con la calidad y precisión que nos caracteriza.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-zinc-200 pb-8">
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 no-scrollbar">
            <div className="flex items-center gap-2 p-1.5 bg-zinc-100 rounded-full border border-zinc-200/80">
              {storeCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                    activeCategory === cat 
                      ? 'bg-black text-white shadow-md' 
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="shrink-0 px-6 py-3 bg-white text-zinc-900 border border-zinc-200 rounded-full font-bold text-sm shadow-sm hover:shadow-md hover:border-zinc-300 transition-all flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ver Carrito</span>
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {filteredProducts.map(product => (
            <div key={product.id} className="group flex flex-col cursor-pointer" onClick={() => { setSelectedProduct(product); setQty(1); setAdded(false); }}>
              {/* Product Image Container */}
              <div className="relative aspect-[4/3] rounded-[2rem] bg-zinc-100 overflow-hidden mb-6">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                
                {/* Tags */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {product.tags.slice(0, 1).map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-zinc-800 shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Quick Add Button - Appears on Hover */}
                <div className="absolute bottom-4 left-0 w-full px-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                    className="w-full py-4 bg-white/95 backdrop-blur-md text-black rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-black hover:text-white transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Añadir al carrito
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col grow px-2">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="text-xl font-bold text-zinc-900 leading-tight">
                    {product.name}
                  </h3>
                  <span className="text-xl font-extrabold text-zinc-900 shrink-0">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 font-medium mb-6 line-clamp-2">
                  {product.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-zinc-200">
            <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-900 mb-2">No hay productos disponibles</h3>
            <p className="text-zinc-500">Intenta seleccionar otra categoría.</p>
          </div>
        )}

            </div>

      {/* Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col md:flex-row max-h-[90vh]"
              >
                {/* Image Section */}
                <div className="md:w-1/2 relative bg-zinc-100">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="w-full h-64 md:h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {selectedProduct.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-zinc-800 shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="md:hidden absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-full text-zinc-800 hover:bg-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content Section */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <span className="text-sm font-bold text-cyan-600 mb-2 block uppercase tracking-wider">{selectedProduct.category}</span>
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 leading-tight">
                        {selectedProduct.name}
                      </h2>
                    </div>
                    <button 
                      onClick={() => setSelectedProduct(null)}
                      className="hidden md:flex p-2 bg-zinc-100 rounded-full text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <p className="text-3xl font-black text-zinc-900 mb-8">
                    ${selectedProduct.price.toFixed(2)}
                  </p>
                  
                  <div className="space-y-6 mb-10 text-zinc-600 leading-relaxed font-medium">
                    <p>{selectedProduct.description}</p>
                    <p>En Design Store nos aseguramos de que cada producto que recibes cuenta con la más alta calidad y un acabado impecable, reflejando el estándar de excelencia de tu marca.</p>
                  </div>

                  <div className="mt-auto flex flex-col sm:flex-row gap-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between border-2 border-zinc-200 rounded-2xl px-2 bg-zinc-50 sm:w-1/3">
                      <button 
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="p-3 text-zinc-500 hover:text-black transition-colors"
                      >
                        -
                      </button>
                      <span className="font-bold text-lg text-zinc-900">{qty}</span>
                      <button 
                        onClick={() => setQty(qty + 1)}
                        className="p-3 text-zinc-500 hover:text-black transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        addToCart(selectedProduct, qty);
                        setAdded(true);
                        setTimeout(() => {
                          setSelectedProduct(null);
                        }, 1000);
                      }}
                      className={`flex-1 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1 ${
                        added 
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                          : 'bg-black text-white hover:bg-zinc-800'
                      }`}
                    >
                      {added ? (
                        <>
                          <Check className="w-6 h-6" />
                          Añadido al carrito
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-6 h-6" />
                          Añadir al carrito - ${(selectedProduct.price * qty).toFixed(2)}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
