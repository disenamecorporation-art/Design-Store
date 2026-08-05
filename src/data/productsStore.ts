import { Product } from '../types';
import { supabase } from '../lib/supabase';
import { products as initialProducts, storeCategories as initialCategories } from './products';

export const storeAPI = {
  getProducts: async (): Promise<Product[]> => {
    try {
      const { data, error } = await supabase.from('store_products').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      if (!data || data.length === 0) return initialProducts; // Fallback for preview
      
      return data.map(item => ({
        ...item,
        price: Number(item.price)
      }));
    } catch (err) {
      console.error('Error fetching products from Supabase:', err);
      // Fallback to local
      const stored = localStorage.getItem('design_store_products');
      if (stored) return JSON.parse(stored);
      return initialProducts;
    }
  },
  
  getCategories: async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase.from('store_categories').select('*').order('name');
      if (error) throw error;
      if (!data || data.length === 0) return initialCategories; // Fallback
      
      return data.map(item => item.name);
    } catch (err) {
      console.error('Error fetching categories:', err);
      const stored = localStorage.getItem('design_store_categories');
      if (stored) return JSON.parse(stored);
      return initialCategories;
    }
  },
  
  saveProducts: async (products: Product[]) => {
    // In a real app we'd upsert, delete removed ones etc.
    // For simplicity, we just save to local storage as fallback
    // and rely on specific API calls for Supabase updates if needed.
    // But since the Admin uses this directly, let's implement upsert:
    try {
      for (const p of products) {
        await supabase.from('store_products').upsert({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.category,
          image: p.image,
          tags: p.tags
        });
      }
      
      // Delete removed products
      const { data: current } = await supabase.from('store_products').select('id');
      if (current) {
        const activeIds = products.map(p => p.id);
        const toDelete = current.filter(c => !activeIds.includes(c.id)).map(c => c.id);
        if (toDelete.length > 0) {
          await supabase.from('store_products').delete().in('id', toDelete);
        }
      }
    } catch (err) {
      console.error('Error saving to Supabase:', err);
    }
    localStorage.setItem('design_store_products', JSON.stringify(products));
  },
  
  saveCategories: async (categories: string[]) => {
    try {
      // Upsert
      for (const cat of categories) {
        await supabase.from('store_categories').upsert({ name: cat }, { onConflict: 'name' });
      }
      
      // Delete removed
      const { data: current } = await supabase.from('store_categories').select('name');
      if (current) {
        const toDelete = current.filter(c => !categories.includes(c.name)).map(c => c.name);
        if (toDelete.length > 0) {
          await supabase.from('store_categories').delete().in('name', toDelete);
        }
      }
    } catch (err) {
      console.error('Error saving categories:', err);
    }
    localStorage.setItem('design_store_categories', JSON.stringify(categories));
  }
};
