-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- MIGRACIÓN / ACTUALIZACIÓN DE COLUMNAS DE LA TABLA ORDERS (Si ya existe)
-- =========================================================================
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('Cotizado', 'Pendiente por impresión', 'En proceso de impresión', 'En proceso de troquelado', 'Terminado', 'Despachado', 'COTIZADO', 'EN PROCESO', 'DESPACHADO'));

-- Añadir nuevas columnas para Puntos Design si no existen
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS points_used NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'USD';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS points_awarded BOOLEAN DEFAULT FALSE;

-- ==========================================
-- 1. TABLA DE PROYECTOS (ÓRDENES / TRACKING)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('Cotizado', 'Pendiente por impresión', 'En proceso de impresión', 'En proceso de troquelado', 'Terminado', 'Despachado', 'COTIZADO', 'EN PROCESO', 'DESPACHADO')),
  customer_name TEXT NOT NULL,
  customer_email TEXT DEFAULT '',
  project_name TEXT NOT NULL,
  total_amount NUMERIC DEFAULT 0,
  points_awarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Realtime para que el tracking y el admin panel se actualicen en vivo
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- ==========================================
-- 2. TABLA DE PERFILES (USUARIOS / ADMIN)
-- ==========================================
-- Vincula la autenticación (auth.users) con los datos del perfil (puntos, rango, rol)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin', 'operator')),
  points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'Standard',
  referred_by TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. TRIGGER PARA AUTO-REGISTRO DE PERFILES
-- ==========================================
-- Vincula el auto-registro con el correo que refirió opcionalmente y el rol adecuado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, points, tier, referred_by)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    CASE WHEN NEW.email = 'admin@designstore.ve' THEN 5000 ELSE 5 END,
    CASE WHEN NEW.email = 'admin@designstore.ve' THEN 'Diamante Elite' ELSE 'Básico' END,
    COALESCE(NEW.raw_user_meta_data->>'referred_by', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =========================================================================
-- 4. TRIGGER PARA GESTIÓN AUTOMÁTICA DE PUNTOS DESIGN AL DESPACHAR
-- =========================================================================
-- Acredita 1 punto x $1 USD en compras o Descuenta puntos en Canjes cuando el estado cambia a 'Despachado'
-- Adicionalmente, premia al referente con Puntos Design en la PRIMERA compra despachada del usuario referido.
CREATE OR REPLACE FUNCTION public.award_points_on_dispatch()
RETURNS TRIGGER AS $
DECLARE
  v_points_to_earn INTEGER;
  v_points_to_deduct INTEGER;
  v_user_id UUID;
  v_current_points INTEGER;
  v_new_points INTEGER;
  v_new_tier TEXT;

  -- Variables para el sistema de referidos
  v_referred_by TEXT;
  v_completed_orders_count INTEGER;
  v_referrer_id UUID;
  v_referrer_current_points INTEGER;
  v_referrer_new_points INTEGER;
  v_referrer_new_tier TEXT;
  v_referral_points INTEGER;
BEGIN
  -- Verificar si la orden pasó a Despachado y aún no se han procesado los puntos
  IF (NEW.status IN ('Despachado', 'DESPACHADO')) 
     AND (OLD.status NOT IN ('Despachado', 'DESPACHADO') OR OLD.points_awarded IS NOT TRUE) 
     AND (NEW.points_awarded IS NOT TRUE) THEN
    
    -- Buscar perfil por correo o nombre del cliente
    SELECT id, points, referred_by INTO v_user_id, v_current_points, v_referred_by
    FROM public.profiles
    WHERE (NEW.customer_email IS NOT NULL AND NEW.customer_email <> '' AND LOWER(email) = LOWER(NEW.customer_email))
       OR LOWER(name) = LOWER(NEW.customer_name)
    LIMIT 1;

    IF v_user_id IS NOT NULL THEN
      -- CASO A: Canje con Puntos Design (descontar)
      IF (NEW.payment_method = 'Puntos Design' OR COALESCE(NEW.points_used, 0) > 0) THEN
        v_points_to_deduct := FLOOR(COALESCE(NEW.points_used, 0));
        v_new_points := GREATEST(0, COALESCE(v_current_points, 0) - v_points_to_deduct);
      -- CASO B: Compra en USD (acreditar)
      ELSE
        v_points_to_earn := FLOOR(COALESCE(NEW.total_amount, 0));
        v_new_points := COALESCE(v_current_points, 0) + v_points_to_earn;
      END IF;

      -- Recalcular rango / tier según el nuevo saldo
      IF v_new_points >= 5000 THEN v_new_tier := 'Diamante Elite';
      ELSIF v_new_points >= 2500 THEN v_new_tier := 'Platino Pro';
      ELSIF v_new_points >= 1000 THEN v_new_tier := 'Oro Pro';
      ELSIF v_new_points >= 500 THEN v_new_tier := 'Plata';
      ELSE v_new_tier := 'Standard';
      END IF;

      UPDATE public.profiles
      SET points = v_new_points,
          tier = v_new_tier
      WHERE id = v_user_id;

      -- =========================================================================
      -- SISTEMA DE REFERIDOS: Premiar al Referente (Persona que refirió)
      -- =========================================================================
      IF v_referred_by IS NOT NULL AND v_referred_by <> '' THEN
        -- Contar cuántas órdenes despachadas tenía este cliente antes de la actual
        SELECT COUNT(*) INTO v_completed_orders_count
        FROM public.orders
        WHERE (customer_email = NEW.customer_email OR customer_name = NEW.customer_name)
          AND status IN ('Despachado', 'DESPACHADO')
          AND id <> NEW.id;

        -- Si el conteo es 0, es su PRIMERA compra despachada
        IF v_completed_orders_count = 0 THEN
          -- Obtener puntos de referido configurados por el administrador
          SELECT COALESCE((value)::integer, 200) INTO v_referral_points
          FROM public.panel3_workshop_config
          WHERE key = 'referral_reward_points';

          IF v_referral_points IS NULL THEN
            v_referral_points := 200; -- valor por defecto
          END IF;

          -- Buscar al referente por su email
          SELECT id, points INTO v_referrer_id, v_referrer_current_points
          FROM public.profiles
          WHERE LOWER(email) = LOWER(v_referred_by)
          LIMIT 1;

          -- Si el referente existe, acreditarle los puntos de referido
          IF v_referrer_id IS NOT NULL THEN
            v_referrer_new_points := COALESCE(v_referrer_current_points, 0) + v_referral_points;

            -- Recalcular rango del referente
            IF v_referrer_new_points >= 5000 THEN v_referrer_new_tier := 'Diamante Elite';
            ELSIF v_referrer_new_points >= 2500 THEN v_referrer_new_tier := 'Platino Pro';
            ELSIF v_referrer_new_points >= 1000 THEN v_referrer_new_tier := 'Oro Pro';
            ELSIF v_referrer_new_points >= 500 THEN v_referrer_new_tier := 'Plata';
            ELSE v_referrer_new_tier := 'Standard';
            END IF;

            UPDATE public.profiles
            SET points = v_referrer_new_points,
                tier = v_referrer_new_tier
            WHERE id = v_referrer_id;
          END IF;
        END IF;
      END IF;

      NEW.points_awarded := TRUE;
    END IF;

  END IF;

  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_award_points_on_dispatch ON public.orders;
CREATE TRIGGER trigger_award_points_on_dispatch
  BEFORE UPDATE OR INSERT ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.award_points_on_dispatch();

-- ==========================================
-- IMPORTANTE: SIN RLS (Row Level Security)
-- ==========================================
-- Asegúrate de que RLS esté desactivado (Disabled) en las tablas
-- 'orders' y 'profiles' en tu dashboard de Supabase.
