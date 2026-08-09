-- =========================================================================
-- TABLA DE PORTAFOLIO DE SERVICIOS (ADMIN PANEL #4 & PORTAFOLIO)
-- Execute esta consulta SQL en el Editor SQL de Supabase
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  client_name TEXT DEFAULT '',
  project_date TEXT DEFAULT '',
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_url_2 TEXT DEFAULT '',
  image_url_3 TEXT DEFAULT '',
  video_url TEXT DEFAULT '',
  rating NUMERIC DEFAULT 5,
  review_text TEXT DEFAULT '',
  reviewer_name TEXT DEFAULT '',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Configuración opcional (Lectura pública y modificación abierta/autenticada)
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de proyectos del portafolio" 
ON public.portfolio_projects FOR SELECT USING (true);

CREATE POLICY "Modificación de proyectos del portafolio" 
ON public.portfolio_projects FOR ALL USING (true);
