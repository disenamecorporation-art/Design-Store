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
CREATE TABLE IF NOT EXISTS public.store_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  points_price NUMERIC DEFAULT 0,
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Si la tabla ya existe en Supabase, ejecuta esta migración:
ALTER TABLE public.store_products ADD COLUMN IF NOT EXISTS points_price NUMERIC DEFAULT 0;

-- Opcional: Desactivar RLS o crear políticas si está activado
-- Asegúrate de tener RLS desactivado o crear una política de lectura/escritura 
-- (para que la app y el admin panel puedan leer y actualizar los productos).
