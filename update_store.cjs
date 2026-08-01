const fs = require('fs');
let storeSrc = fs.readFileSync('src/components/StoreView.tsx', 'utf8');

if (!storeSrc.includes('import { motion, AnimatePresence }')) {
  storeSrc = storeSrc.replace(
    /import \{ Product \} from '\.\.\/types';/,
    "import { Product } from '../types';\nimport { motion, AnimatePresence } from 'motion/react';\nimport { X, Check } from 'lucide-react';"
  );
}

// Add state for modal
storeSrc = storeSrc.replace(
  /const \[activeCategory, setActiveCategory\] = useState\('Todos'\);/,
  `const [activeCategory, setActiveCategory] = useState('Todos');\n  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);\n  const [qty, setQty] = useState(1);\n  const [added, setAdded] = useState(false);`
);

// Update padding pt-32 to pt-48 (or pt-40)
storeSrc = storeSrc.replace(
  /className="min-h-screen pt-32 pb-24 px-4 sm:px-8 bg-zinc-50 font-\['Manrope',sans-serif\]"/,
  `className="min-h-screen pt-40 md:pt-48 pb-24 px-4 sm:px-8 bg-zinc-50 font-['Manrope',sans-serif]"`
);

// Add onClick to open modal for product (except the add to cart button itself)
storeSrc = storeSrc.replace(
  /<div key=\{product\.id\} className="group flex flex-col">/g,
  `<div key={product.id} className="group flex flex-col cursor-pointer" onClick={() => { setSelectedProduct(product); setQty(1); setAdded(false); }}>`
);

// Ensure quick add doesn't trigger modal
storeSrc = storeSrc.replace(
  /onClick=\{\(\) => handleAddToCart\(product\)\}/g,
  `onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}`
);

// Add modal JSX at the end of the return statement
storeSrc = storeSrc.replace(
  /<\/div>\s*<\/div>\s*\);\s*\};\s*$/g,
  `      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto flex flex-col md:flex-row max-h-[90vh]"
              >
                {/* Image Section */}
                <div className="md:w-1/2 relative bg-zinc-100">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="w-full h-64 md:h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {selectedProduct.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-zinc-800 shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="md:hidden absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-full text-zinc-800 hover:bg-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content Section */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col overflow-y-auto">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <span className="text-sm font-bold text-cyan-600 mb-2 block uppercase tracking-wider">{selectedProduct.category}</span>
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 leading-tight">
                        {selectedProduct.name}
                      </h2>
                    </div>
                    <button 
                      onClick={() => setSelectedProduct(null)}
                      className="hidden md:flex p-2 bg-zinc-100 rounded-full text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <p className="text-3xl font-black text-zinc-900 mb-8">
                    \${selectedProduct.price.toFixed(2)}
                  </p>
                  
                  <div className="space-y-6 mb-10 text-zinc-600 leading-relaxed font-medium">
                    <p>{selectedProduct.description}</p>
                    <p>En Design Store nos aseguramos de que cada producto que recibes cuenta con la más alta calidad y un acabado impecable, reflejando el estándar de excelencia de tu marca.</p>
                  </div>

                  <div className="mt-auto flex flex-col sm:flex-row gap-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between border-2 border-zinc-200 rounded-2xl px-2 bg-zinc-50 sm:w-1/3">
                      <button 
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="p-3 text-zinc-500 hover:text-black transition-colors"
                      >
                        -
                      </button>
                      <span className="font-bold text-lg text-zinc-900">{qty}</span>
                      <button 
                        onClick={() => setQty(qty + 1)}
                        className="p-3 text-zinc-500 hover:text-black transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        addToCart(selectedProduct, qty);
                        setAdded(true);
                        setTimeout(() => {
                          setSelectedProduct(null);
                        }, 1000);
                      }}
                      className={\`flex-1 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1 \${
                        added 
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                          : 'bg-black text-white hover:bg-zinc-800'
                      }\`}
                    >
                      {added ? (
                        <>
                          <Check className="w-6 h-6" />
                          Añadido al carrito
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-6 h-6" />
                          Añadir al carrito - \${(selectedProduct.price * qty).toFixed(2)}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
`
);

fs.writeFileSync('src/components/StoreView.tsx', storeSrc);
console.log('Store view updated');
