const fs = require('fs');
let typesSrc = fs.readFileSync('src/types.ts', 'utf8');

typesSrc = typesSrc.replace(
  /export type TabType = 'inicio' \| 'cotizar' \| 'servicios' \| 'calculadora' \| 'entrar' \| 'registro' \| 'cuenta' \| 'tutorial-imagenes' \| 'tracking' \| 'admin';/,
  "export type TabType = 'inicio' | 'cotizar' | 'servicios' | 'calculadora' | 'entrar' | 'registro' | 'cuenta' | 'tutorial-imagenes' | 'tracking' | 'admin' | 'store' | 'checkout';"
);

typesSrc += `
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  tags: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
`;

fs.writeFileSync('src/types.ts', typesSrc);
