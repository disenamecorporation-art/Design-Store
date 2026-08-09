export type TabType = 'inicio' | 'cotizar' | 'servicios' | 'portafolio' | 'calculadora' | 'entrar' | 'registro' | 'cuenta' | 'tutorial-imagenes' | 'tracking' | 'admin' | 'store' | 'checkout' | 'store-admin' | 'admin-p3' | 'admin-p4';

export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  clientName: string;
  projectDate: string;
  description: string;
  imageUrl: string;
  imageUrl2?: string;
  imageUrl3?: string;
  videoUrl?: string;
  rating: number;
  reviewText?: string;
  reviewerName?: string;
  featured?: boolean;
  createdAt?: string;
}

export type OrderStatus = 
  | 'Cotizado'
  | 'Pendiente por impresión'
  | 'En proceso de impresión'
  | 'En proceso de troquelado'
  | 'Terminado'
  | 'Despachado';

export interface Order {
  id: string;
  status: OrderStatus;
  customerName: string;
  customerEmail?: string;
  projectName: string;
  totalAmount?: number;
  pointsUsed?: number;
  paymentMethod?: 'USD' | 'Puntos Design';
  pointsAwarded?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  image: string; // editable placeholder
  features: string[];
  iconName: string;
}

export interface BusinessCardForm {
  fullName: string;
  phone: string;
  email: string;
  quantity: number;
  finish: 'mate' | 'brillante' | 'texturizado';
  frontUrl: string;
  backUrl: string;
  comments: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  pointsPrice?: number;
  category: string;
  image: string;
  tags: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
