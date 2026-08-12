-- =========================================================================
-- ESQUEMA COMPLETO PARA EL PANEL #3 (SISTEMA DE TALLER & COTIZACIONES)
-- Ejecuta este script SQL en el Editor SQL de Supabase para inicializar
-- o actualizar todas las tablas de tu sistema de taller.
-- =========================================================================

-- 1. CONFIGURACIÓN DEL TALLER
CREATE TABLE IF NOT EXISTS public.panel3_workshop_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS e insertar valor inicial para la estimación diaria de m2 si no existe
ALTER TABLE public.panel3_workshop_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública de config de taller" ON public.panel3_workshop_config FOR SELECT USING (true);
CREATE POLICY "Modificación libre de config de taller" ON public.panel3_workshop_config FOR ALL USING (true);

INSERT INTO public.panel3_workshop_config (key, value)
VALUES ('daily_est_m2', '35')
ON CONFLICT (key) DO NOTHING;


-- 2. CLIENTES DEL TALLER
CREATE TABLE IF NOT EXISTS public.panel3_clients (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  rif TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.panel3_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública de clientes" ON public.panel3_clients FOR SELECT USING (true);
CREATE POLICY "Modificación libre de clientes" ON public.panel3_clients FOR ALL USING (true);


-- 3. INVENTARIO DE MATERIALES
CREATE TABLE IF NOT EXISTS public.panel3_inventory (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT NOT NULL,
  art_code TEXT DEFAULT '',
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  stock NUMERIC NOT NULL DEFAULT 0,
  width_cm NUMERIC NOT NULL DEFAULT 0,
  length_cm NUMERIC NOT NULL DEFAULT 0,
  price_per_m2 NUMERIC NOT NULL DEFAULT 0,
  damaged_m2 NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.panel3_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública de inventario" ON public.panel3_inventory FOR SELECT USING (true);
CREATE POLICY "Modificación libre de inventario" ON public.panel3_inventory FOR ALL USING (true);


-- 4. COTIZACIONES DEL TALLER
CREATE TABLE IF NOT EXISTS public.panel3_quotes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT NOT NULL,
  client_id TEXT,
  client_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  job_name TEXT NOT NULL,
  material_id TEXT,
  material_name TEXT,
  sheet_format TEXT DEFAULT '',
  quantity NUMERIC NOT NULL DEFAULT 1,
  piece_width_cm NUMERIC NOT NULL,
  piece_length_cm NUMERIC NOT NULL,
  separation_cm NUMERIC DEFAULT 0,
  margin_cm NUMERIC DEFAULT 0,
  profit_margin_pct NUMERIC DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD $',
  exchange_rate NUMERIC NOT NULL DEFAULT 1,
  include_iva BOOLEAN DEFAULT FALSE,
  iva_pct NUMERIC DEFAULT 16,
  notes TEXT DEFAULT '',
  delivery_date TEXT DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'Normal',
  quote_type TEXT NOT NULL DEFAULT 'Cotización regular',
  total_usd NUMERIC NOT NULL DEFAULT 0,
  total_bs NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'Aprobada', 'Rechazada')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.panel3_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública de cotizaciones" ON public.panel3_quotes FOR SELECT USING (true);
CREATE POLICY "Modificación libre de cotizaciones" ON public.panel3_quotes FOR ALL USING (true);


-- 5. ÓRDENES DE PRODUCCIÓN
CREATE TABLE IF NOT EXISTS public.panel3_production_orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_code TEXT NOT NULL,
  quote_code TEXT NOT NULL,
  project_name TEXT NOT NULL,
  operator TEXT NOT NULL,
  machine TEXT DEFAULT '',
  die_cutter TEXT DEFAULT '',
  copies NUMERIC NOT NULL DEFAULT 1,
  net_m2 NUMERIC DEFAULT 0,
  m2_with_waste NUMERIC DEFAULT 0,
  eyelets NUMERIC DEFAULT 0,
  banner_holders NUMERIC DEFAULT 0,
  lamination TEXT DEFAULT '',
  cut_type TEXT DEFAULT '',
  priority TEXT DEFAULT 'Normal',
  delivery_date TEXT DEFAULT '',
  arrival_date TEXT DEFAULT '',
  order_type TEXT DEFAULT 'Nuevo',
  is_repetition BOOLEAN DEFAULT FALSE,
  tech_notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'En Proceso' CHECK (status IN ('En Proceso', 'Terminada')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.panel3_production_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública de ordenes" ON public.panel3_production_orders FOR SELECT USING (true);
CREATE POLICY "Modificación libre de ordenes" ON public.panel3_production_orders FOR ALL USING (true);


-- 6. COSTOS INTERNOS
CREATE TABLE IF NOT EXISTS public.panel3_internal_costs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  concept TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Costo fijo', 'Costo variable')),
  period TEXT NOT NULL CHECK (period IN ('Mensual', 'Semanal', 'Diario')),
  amount_usd NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.panel3_internal_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública de costos" ON public.panel3_internal_costs FOR SELECT USING (true);
CREATE POLICY "Modificación libre de costos" ON public.panel3_internal_costs FOR ALL USING (true);


-- 7. MOVIMIENTOS FINANCIEROS (VENTAS Y COMPRAS)
CREATE TABLE IF NOT EXISTS public.panel3_financial_movements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  concept TEXT NOT NULL,
  movement_type TEXT NOT NULL,
  quote_code TEXT DEFAULT '',
  amount_usd NUMERIC NOT NULL DEFAULT 0,
  amount_bs NUMERIC NOT NULL DEFAULT 0,
  exchange_rate NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.panel3_financial_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública de movimientos" ON public.panel3_financial_movements FOR SELECT USING (true);
CREATE POLICY "Modificación libre de movimientos" ON public.panel3_financial_movements FOR ALL USING (true);


-- 8. REGISTRO E HISTORIAL DE INVENTARIO
CREATE TABLE IF NOT EXISTS public.panel3_inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id TEXT NOT NULL,
  material_name TEXT NOT NULL,
  log_type TEXT NOT NULL CHECK (log_type IN ('Entrada', 'Salida Directa', 'Salida Orden')),
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  operator TEXT NOT NULL,
  machine TEXT DEFAULT '',
  reference TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.panel3_inventory_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública de logs" ON public.panel3_inventory_logs FOR SELECT USING (true);
CREATE POLICY "Modificación libre de logs" ON public.panel3_inventory_logs FOR ALL USING (true);
