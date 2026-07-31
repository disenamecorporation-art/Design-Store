import { ServiceItem, Testimonial } from './types';

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'gigantografia',
    title: 'Gigantografía',
    category: 'Impresión Gran Formato',
    shortDesc: 'Etiquetas, pendones, banners, vallas publicitarias y rótulos de alto impacto visual con tintas eco-solventes.',
    fullDesc: 'Fabricamos soluciones de gran formato ideales para publicidad exterior e interior. Utilizamos materiales de máxima durabilidad (lona frontlight, backlight, vinilo adhesivo microperforado, lona mesh) y tintas resistentes a rayos UV y condiciones climáticas extremas en Venezuela.',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
    features: ['Vallas publicitarias y avisos luminosos', 'Pendones roll-up y arañas', 'Vinilos autoadhesivos para flotas y vitrinas', 'Banners microperforados para exteriores'],
    iconName: 'Maximize2'
  },
  {
    id: 'impresion-3d',
    title: 'Impresión 3D',
    category: 'Prototipado & Fabricación',
    shortDesc: 'Modelado y fabricación aditiva de alta precisión en PLA, ABS, PETG y resina para prototipos o piezas finales.',
    fullDesc: 'Transformamos tus ideas digitales en objetos físicos reales. Contamos con gran variedad de equipos FDM y Resina SLA para prototipos industriales, piezas mecánicas funcionales, maquetas arquitectónicas, figuras coleccionables y merchandising personalizado.',
    image: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&w=1200&q=80',
    features: ['Prototipado rápido y funcional', 'Impresión en Resina UV de alta resolución', 'Piezas a medida en polímeros técnicos', 'Post-procesado y acabado pintado a mano'],
    iconName: 'Box'
  },
  {
    id: 'grabado-laser',
    title: 'Grabados Láser',
    category: 'Corte y Marcaje de Alta Definición',
    shortDesc: 'Corte y grabado láser de precisión milimétrica sobre acrílico, madera, cuero, vidrio y metales.',
    fullDesc: 'Personaliza y marca tus productos con una calidad insuperable. El grabado láser ofrece durabilidad eterna y acabados sumamente elegantes para placas de reconocimiento, señalización corporativa, artículos promocionales y corte de piezas complejas.',
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
    features: ['Corte y grabado en acrílico y MDF', 'Personalización de artículos promocionales', 'Señalética industrial y corporativa', 'Grabado en cuero, vidrio y metal anodizado'],
    iconName: 'Zap'
  },
  {
    id: 'diseno-empaques',
    title: 'Diseño Gráfico para Empaques',
    category: 'Packaging & Branding',
    shortDesc: 'Estrategia, diseño estructural y gráfico de envases, cajas y etiquetas que enamoran en el punto de venta.',
    fullDesc: 'El empaque es el vendedor silencioso de tu marca. Diseñamos experiencias de unboxing memorables, optimizando la ergonomía, la resistencia estructural y el atractivo visual para destacar en cualquier anaquel nacional o internacional.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80',
    features: ['Diseño estructural de cajas y estuches', 'Identidad visual y etiquetado normativo', 'Renderizado 3D realista previo a producción', 'Asesoría en selección de papeles y acabados'],
    iconName: 'Package'
  },
  {
    id: 'flexografia-digital',
    title: 'Impresión Digital y Flexografía',
    category: 'Producción en Serie',
    shortDesc: 'Tirajes cortos y masivos de etiquetas en rollo, papelería comercial, folletos y material POP.',
    fullDesc: 'Soluciones versátiles para marcas en crecimiento y grandes corporaciones. Desde impresiones digitales láser de alta velocidad hasta flexografía para etiquetas en rollo con acabados especiales (foil dorado, barniz UV sectorizado y troquelado).',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80',
    features: ['Etiquetas autoadhesivas en rollo', 'Papelería corporativa premium', 'Catálogos, revistas y flyers', 'Acabados con foil stamping y troquel'],
    iconName: 'Printer'
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: '1',
    name: 'Alejandro Martí',
    role: 'Director de Operaciones',
    company: 'Alimentos Andinos C.A.',
    content: 'El diseño de empaques y la impresión flexográfica que realizamos con Design Store superó todas nuestras expectativas. El producto destaca inmediatamente en los anaqueles de supermercados.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: '2',
    name: 'Mariana Castillo',
    role: 'Gerente de Marketing',
    company: 'Inmobiliaria Altamira',
    content: 'Las vallas y gigantografías para nuestro último proyecto residencial tienen una nitidez y resistencia al sol impecables. El tiempo de entrega fue récord en Caracas.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: '3',
    name: 'Ing. Carlos Mendoza',
    role: 'Jefe de Prototipos',
    company: 'TecnoIndustrias VZLA',
    content: 'El servicio de impresión 3D y grabado láser nos permite desarrollar piezas industriales complejas con tolerancias milimétricas en cuestión de horas. Excelentes profesionales.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  }
];
