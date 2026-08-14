export interface Panel3Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  rif: string;
  address: string;
  created_at?: string;
}

export interface Panel3InventoryItem {
  id: string;
  code: string;
  art_code?: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  width_cm: number;
  length_cm: number;
  price_per_m2: number;
  damaged_m2: number;
  created_at?: string;
}

export interface Panel3Quote {
  id: string;
  code: string;
  client_id?: string;
  client_name: string;
  product_type: string;
  job_name: string;
  material_id?: string;
  material_name?: string;
  sheet_format?: string;
  quantity: number;
  piece_width_cm: number;
  piece_length_cm: number;
  separation_cm: number;
  margin_cm: number;
  profit_margin_pct: number;
  currency: 'USD $' | 'Bs';
  exchange_rate: number;
  include_iva: boolean;
  iva_pct: number;
  notes?: string;
  delivery_date?: string;
  priority: 'Baja' | 'Normal' | 'Alta' | 'Urgente';
  quote_type: 'Cotización regular' | 'Muestra sin cobro' | 'Prototipo' | 'Promocional';
  total_usd: number;
  total_bs: number;
  status: 'Pendiente' | 'Aprobada' | 'Rechazada';
  created_at?: string;
}

export interface Panel3ProductionOrder {
  id: string;
  order_code: string;
  quote_code: string;
  project_name: string;
  operator: string;
  machine: string;
  die_cutter: string;
  copies: number;
  net_m2: number;
  m2_with_waste: number;
  eyelets: number;
  banner_holders: number;
  lamination: string;
  cut_type: string;
  priority: string;
  delivery_date: string;
  arrival_date: string;
  order_type: 'Nuevo' | 'Repetición';
  is_repetition: boolean;
  tech_notes: string;
  status: 'En Proceso' | 'Terminada';
  created_at?: string;
}

export interface Panel3InternalCost {
  id: string;
  concept: string;
  category: 'Costo fijo' | 'Costo variable';
  period: 'Mensual' | 'Semanal' | 'Diario';
  amount_usd: number;
  created_at?: string;
}

export interface Panel3FinancialMovement {
  id: string;
  concept: string;
  movement_type: string;
  quote_code?: string;
  amount_usd: number;
  amount_bs: number;
  exchange_rate: number;
  created_at?: string;
}

export interface Panel3InventoryLog {
  id: string;
  material_id: string;
  material_name: string;
  log_type: 'Entrada' | 'Salida Directa' | 'Salida Orden';
  quantity: number;
  unit: string;
  operator: string;
  machine?: string;
  reference?: string;
  created_at?: string;
}

export interface Panel3Machine {
  id: string;
  name: string;
  status: 'Operativa' | 'En Mantenimiento';
  created_at?: string;
}

export interface Panel3Referral {
  id: string;
  referrer_email: string;
  referred_email: string;
  points_rewarded: number;
  rewarded_at?: string;
  created_at?: string;
}

