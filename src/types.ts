export type TabType = 'inicio' | 'cotizar' | 'servicios' | 'calculadora' | 'entrar' | 'registro' | 'cuenta' | 'tutorial-imagenes';

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
