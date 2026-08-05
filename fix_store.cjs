const fs = require('fs');
let storeSrc = fs.readFileSync('src/components/StoreView.tsx', 'utf8');

// Update imports
storeSrc = storeSrc.replace(
  /import \{ products, storeCategories \} from '\.\.\/data\/products';/,
  "import { storeAPI } from '../data/productsStore';"
);

// Update StoreView Component
const newComponentStart = `export const StoreView: React.FC = () => {
  const { addToCart, setIsCartOpen } = useCart();
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // New state for Store
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(100);

  React.useEffect(() => {
    setProducts(storeAPI.getProducts());
    setCategories(storeAPI.getCategories());
  }, []);

  const filteredProducts = products.filter(p => {
    const matchCategory = activeCategory === 'Todos' || p.category === activeCategory;
    const matchPrice = p.price <= priceRange;
    return matchCategory && matchPrice;
  });

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };
`;

storeSrc = storeSrc.replace(
  /export const StoreView: React\.FC = \(\) => \{[\s\S]*?const handleAddToCart = \(product: Product\) => \{[\s\S]*?\};\s*/,
  newComponentStart
);

// Now update the layout to a sidebar layout
const oldLayoutRegex = /\{\/\* Filters \*\/\}[\s\S]*?\{\/\* Product Grid \*\/\}[\s\S]*?(?=\{\/\* Product Modal \*\/)/;

const newLayout = `
        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Sidebar (Filters) */}
          <div className="lg:w-1/4 shrink-0 space-y-8">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-200 sticky top-48">
              
              <div className="mb-8">
                <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" /> Categorías
                </h3>
                <div className="flex flex-col gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={\`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all \${
                        activeCategory === cat 
                          ? 'bg-black text-white shadow-md' 
                          : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                      }\`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-zinc-900 mb-4">Filtrar por Precio</h3>
                <div className="space-y-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="200" 
                    step="5"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-black h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between items-center text-sm font-bold text-zinc-600">
                    <span>$0</span>
                    <span className="text-black bg-zinc-100 px-3 py-1 rounded-lg">Hasta: $\${priceRange}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-8 border-b border-zinc-200 pb-4">
              <p className="text-zinc-500 font-medium">Mostrando <span className="font-bold text-black">{filteredProducts.length}</span> resultados</p>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="px-6 py-2.5 bg-black text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Ver Carrito</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
              {filteredProducts.map(product => (
                <div key={product.id} className="group flex flex-col cursor-pointer" onClick={() => { setSelectedProduct(product); setQty(1); setAdded(false); }}>
                  {/* Product Image Container */}
                  <div className="relative aspect-[4/3] rounded-[2rem] bg-zinc-100 overflow-hidden mb-6">
                    <img 
                      src={product.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=600'} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                    
                    {/* Tags */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {product.tags.slice(0, 1).map(tag => (
                        <span key={tag} className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-zinc-800 shadow-sm">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Quick Add Button - Appears on Hover */}
                    <div className="absolute bottom-4 left-0 w-full px-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                        className="w-full py-4 bg-white/95 backdrop-blur-md text-black rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-black hover:text-white transition-colors"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        Añadir al carrito
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col grow px-2">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="text-xl font-bold text-zinc-900 leading-tight">
                        {product.name}
                      </h3>
                      <span className="text-xl font-extrabold text-zinc-900 shrink-0">
                        \${product.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 font-medium mb-6 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-24 bg-white rounded-3xl border border-zinc-200">
                <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-zinc-900 mb-2">No se encontraron productos</h3>
                <p className="text-zinc-500">Intenta con otros filtros de búsqueda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
`;

storeSrc = storeSrc.replace(oldLayoutRegex, newLayout);

fs.writeFileSync('src/components/StoreView.tsx', storeSrc);
console.log('Store view layout updated');
