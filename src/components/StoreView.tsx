import React, { useState } from 'react';
import { storeAPI } from '../data/productsStore';
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

  // New state for Store
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(100);

  React.useEffect(() => {
    storeAPI.getProducts().then(setProducts);
    storeAPI.getCategories().then(setCategories);
  }, []);

  const filteredProducts = products.filter(p => {
    const matchCategory = activeCategory === 'Todos' || p.category === activeCategory;
    const matchPrice = p.price <= priceRange;
    return matchCategory && matchPrice;
  });

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };
return (
    <div className="min-h-screen pt-48 md:pt-56 pb-24 px-4 sm:px-8 bg-zinc-50 font-['Manrope',sans-serif]">
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

        
        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Sidebar (Filters) */}
          <div className="lg:w-1/4 shrink-0 space-y-8">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-200 lg:sticky lg:top-48">
              
              <div className="mb-8">
                <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" /> Categorías
                </h3>
                <div className="flex flex-col gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        activeCategory === cat 
                          ? 'bg-black text-white shadow-md' 
                          : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-zinc-900 mb-4">Filtrar por Precio</h3>
                <div className="space-y-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="200" 
                    step="5"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-black h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between items-center text-sm font-bold text-zinc-600">
                    <span>$0</span>
                    <span className="text-black bg-zinc-100 px-3 py-1 rounded-lg">Hasta: ${priceRange}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-8 border-b border-zinc-200 pb-4">
              <p className="text-zinc-500 font-medium">Mostrando <span className="font-bold text-black">{filteredProducts.length}</span> resultados</p>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="px-6 py-2.5 bg-black text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Ver Carrito</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
              {filteredProducts.map(product => (
                <div key={product.id} className="group flex flex-col cursor-pointer" onClick={() => { setSelectedProduct(product); setQty(1); setAdded(false); }}>
                  {/* Product Image Container */}
                  <div className="relative aspect-[4/3] rounded-[2rem] bg-zinc-100 overflow-hidden mb-6">
                    <img 
                      src={product.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=600'} 
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
                      <div className="text-right shrink-0">
                        <span className="text-xl font-extrabold text-zinc-900 block">
                          ${product.price.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-amber-200/60">
                          ✨ {product.pointsPrice ?? Math.round(product.price * 10)} pts
                        </span>
                      </div>
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
                <h3 className="text-xl font-bold text-zinc-900 mb-2">No se encontraron productos</h3>
                <p className="text-zinc-500">Intenta con otros filtros de búsqueda.</p>
              </div>
            )}
          </div>
        </div>
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
                  
                  <div className="flex flex-wrap items-center gap-4 mb-8">
                    <p className="text-3xl font-black text-zinc-900">
                      ${selectedProduct.price.toFixed(2)} <span className="text-sm font-bold text-zinc-400">USD</span>
                    </p>
                    <span className="text-sm font-extrabold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                      ✨ {selectedProduct.pointsPrice ?? Math.round(selectedProduct.price * 10)} Puntos Design
                    </span>
                  </div>
                  
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
