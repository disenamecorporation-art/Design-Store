import { Product } from '../types';

export const products: Product[] = [
  {
    id: 'prod_1',
    name: 'Tarjetas de Presentación Premium',
    description: 'Impresión de alta calidad en papel glasé 300g con laminado mate. El estándar dorado para profesionales.',
    price: 25.00,
    category: 'Tarjetas',
    image: 'https://images.unsplash.com/photo-1572983577717-b76dafc4672e?auto=format&fit=crop&q=80&w=600',
    tags: ['Premium', 'Mate', '300g']
  },
  {
    id: 'prod_2',
    name: 'Tarjetas UV Localizado',
    description: 'Destaca con detalles en brillo sobre un fondo mate elegante. Una experiencia táctil inigualable.',
    price: 45.00,
    category: 'Tarjetas',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600',
    tags: ['UV', 'Lujo', 'Mate']
  },
  {
    id: 'prod_3',
    name: 'Banner Roll-up 80x200cm',
    description: 'Estructura de aluminio y banner impreso en alta resolución. Ideal para eventos y exposiciones.',
    price: 85.00,
    category: 'Gigantografía',
    image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&q=80&w=600',
    tags: ['Eventos', 'Portátil', 'Alta Resolución']
  },
  {
    id: 'prod_4',
    name: 'Tazas Sublimadas Personalizadas',
    description: 'Tazas de cerámica de 11oz con impresión fotográfica 360 grados. El regalo corporativo perfecto.',
    price: 8.50,
    category: 'Promocional',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=600',
    tags: ['Regalo', 'Cerámica', 'Personalizado']
  },
  {
    id: 'prod_5',
    name: 'Franelas Estampadas en DTF',
    description: 'Franelas 100% algodón con estampado DTF de alta durabilidad y colores vibrantes sin límite.',
    price: 15.00,
    category: 'Textil',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600',
    tags: ['Ropa', 'Algodón', 'Color']
  },
  {
    id: 'prod_6',
    name: 'Flyers Media Carta (1000 unds)',
    description: 'Publicidad masiva al mejor costo. Impresión full color por ambas caras en papel glasé 115g.',
    price: 60.00,
    category: 'Publicidad',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=600',
    tags: ['Masivo', 'Full Color', 'Económico']
  }
];

export const storeCategories = ['Todos', 'Tarjetas', 'Gigantografía', 'Promocional', 'Textil', 'Publicidad'];
