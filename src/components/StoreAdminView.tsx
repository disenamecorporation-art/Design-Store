import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { storeAPI } from '../data/productsStore';
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon, Tag, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const StoreAdminView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    storeAPI.getProducts().then(setProducts);
    storeAPI.getCategories().then(setCategories);
  }, []);

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    storeAPI.saveProducts(newProducts);
  };

  const saveCategories = (newCategories: string[]) => {
    setCategories(newCategories);
    storeAPI.saveCategories(newCategories);
  };

  const handleAddCategory = () => {
    if (categoryInput.trim() && !categories.includes(categoryInput.trim())) {
      saveCategories([...categories, categoryInput.trim()]);
      setCategoryInput('');
    }
  };

  const handleDeleteCategory = (cat: string) => {
    saveCategories(categories.filter(c => c !== cat));
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este producto?')) {
      saveProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    if (products.find(p => p.id === editingProduct.id)) {
      saveProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    } else {
      saveProducts([...products, { ...editingProduct, id: `prod_${Date.now()}` }]);
    }
    setIsModalOpen(false);
  };

  const openNewProduct = () => {
    setEditingProduct({
      id: '',
      name: '',
      description: '',
      price: 0,
      category: categories[0] || 'Todos',
      image: '',
      tags: []
    });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen pt-48 md:pt-56 pb-24 px-4 sm:px-8 bg-zinc-50 font-['Manrope',sans-serif]">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">Admin Tienda</h1>
            <p className="text-zinc-500 font-medium mt-2">Gestiona los productos y categorías de tu catálogo.</p>
          </div>
          <button 
            onClick={openNewProduct}
            className="px-6 py-3 bg-black text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Categories Manager */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-200 lg:col-span-1 h-fit">
            <h3 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-indigo-500" />
              Categorías
            </h3>
            
            <div className="space-y-3 mb-6">
              {categories.map(cat => (
                <div key={cat} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <span className="font-semibold text-sm text-zinc-700">{cat}</span>
                  {cat !== 'Todos' && (
                    <button onClick={() => handleDeleteCategory(cat)} className="text-zinc-400 hover:text-red-500 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                value={categoryInput}
                onChange={e => setCategoryInput(e.target.value)}
                placeholder="Nueva categoría..."
                className="flex-1 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
              <button 
                onClick={handleAddCategory}
                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shrink-0"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Products List */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-[2rem] shadow-sm border border-zinc-200 overflow-hidden flex flex-col group">
                  <div className="h-48 relative overflow-hidden bg-zinc-100">
                    <img src={product.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=600'} alt={product.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-zinc-800 shadow-sm uppercase tracking-wider">
                      {product.category}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h4 className="font-bold text-zinc-900 line-clamp-1 mb-1">{product.name}</h4>
                    <p className="text-xl font-black text-indigo-600 mb-4">${product.price.toFixed(2)}</p>
                    
                    <div className="mt-auto flex gap-2">
                      <button 
                        onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                        className="flex-1 py-2.5 bg-zinc-100 text-zinc-700 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {products.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-zinc-200 border-dashed">
                <p className="text-zinc-500 font-medium">No hay productos en la tienda.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <h3 className="text-2xl font-bold text-zinc-900">
                  {editingProduct.id ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
                  <X className="w-5 h-5 text-zinc-600" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="product-form" onSubmit={handleSaveProduct} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Nombre del Producto</label>
                      <input required type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Precio ($)</label>
                      <input required type="number" step="0.01" min="0" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Categoría</label>
                      <select required value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all cursor-pointer">
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> URL de Imagen
                      </label>
                      <input required type="url" value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} placeholder="https://..." className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
                      {editingProduct.image && (
                        <div className="mt-3 h-32 w-32 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100">
                          <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <Tag className="w-4 h-4" /> Etiquetas (separadas por coma)
                      </label>
                      <input type="text" value={editingProduct.tags.join(', ')} onChange={e => setEditingProduct({...editingProduct, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})} placeholder="Premium, Mate, 300g..." className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Descripción Detallada</label>
                      <textarea required rows={4} value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none"></textarea>
                    </div>
                  </div>

                </form>
              </div>

              <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex gap-4 sticky bottom-0 z-10 rounded-b-[2.5rem]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-white border border-zinc-200 text-zinc-700 rounded-2xl font-bold hover:bg-zinc-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" form="product-form" className="flex-1 py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  <Save className="w-5 h-5" />
                  Guardar Producto
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
