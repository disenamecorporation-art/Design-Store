-- =========================================================================
-- TABLA DE HISTORIAL Y TRAZABILIDAD DE INVENTARIO (PANEL #3)
-- Ejecuta este script SQL en el Editor SQL de tu panel de Supabase
-- para habilitar la trazabilidad completa del inventario de taller.
-- =========================================================================

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

-- Habilitar seguridad de nivel de fila (RLS) opcional
ALTER TABLE public.panel3_inventory_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para panel3_inventory_logs
CREATE POLICY "Lectura pública de logs de inventario" 
ON public.panel3_inventory_logs FOR SELECT USING (true);

-- Permite insertar registros desde la aplicación
CREATE POLICY "Inserción libre de logs de inventario" 
ON public.panel3_inventory_logs FOR INSERT WITH CHECK (true);

-- Permite eliminar registros (ej. revertir orden)
CREATE POLICY "Eliminación libre de logs de inventario" 
ON public.panel3_inventory_logs FOR DELETE USING (true);
