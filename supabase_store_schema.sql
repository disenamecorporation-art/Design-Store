-- ==========================================
-- 1. TABLA DE CATEGORÍAS (TIENDA)
-- ==========================================
CREATE TABLE public.store_categories (
  name TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. TABLA DE PRODUCTOS (TIENDA)
-- ==========================================
CREATE TABLE public.store_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opcional: Desactivar RLS o crear políticas si está activado
-- Asegúrate de tener RLS desactivado o crear una política de lectura/escritura 
-- (para que la app y el admin panel puedan leer y actualizar los productos).
