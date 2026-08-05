-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. TABLA DE PROYECTOS (ÓRDENES / TRACKING)
-- ==========================================
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('Cotizado', 'Pendiente por impresión', 'En proceso de impresión', 'En proceso de troquelado', 'Terminado', 'Despachado', 'COTIZADO', 'EN PROCESO', 'DESPACHADO')),
  customer_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Realtime para que el tracking y el admin panel se actualicen en vivo
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- ==========================================
-- 2. TABLA DE PERFILES (USUARIOS / ADMIN)
-- ==========================================
-- Vincula la autenticación (auth.users) con los datos del perfil (puntos, rango, rol)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'Standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. TRIGGER PARA AUTO-REGISTRO DE PERFILES
-- ==========================================
-- Cuando un usuario se registra en la web (login/registro), esto crea su perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, points, tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    -- Lógica para asignar puntos y tier demo a nuevos usuarios
    CASE WHEN NEW.email = 'admin@designstore.ve' THEN 5000 ELSE 750 END,
    CASE WHEN NEW.email = 'admin@designstore.ve' THEN 'Diamante Elite' ELSE 'Oro Pro' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparador que ejecuta la función al insertar en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- IMPORTANTE: SIN RLS (Row Level Security)
-- ==========================================
-- Tal como solicitaste, no se incluyeron políticas RLS. 
-- Todo será accesible directamente desde la aplicación. 
-- Asegúrate de que el RLS esté desactivado (Disabled) en las tablas 
-- 'orders' y 'profiles' en tu dashboard de Supabase.
