const fs = require('fs');

let navbarSrc = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

if (!navbarSrc.includes('import { useCart }')) {
  navbarSrc = navbarSrc.replace(
    /import \{ supabase \} from '\.\.\/lib\/supabase';/,
    `import { supabase } from '../lib/supabase';\nimport { useCart } from '../hooks/useCart';\nimport { ShoppingBag } from 'lucide-react';`
  );
}

// Inside component
navbarSrc = navbarSrc.replace(
  /const \[isAdmin, setIsAdmin\] = useState\(false\);/,
  `const [isAdmin, setIsAdmin] = useState(false);\n  const { cartCount, setIsCartOpen } = useCart();`
);

// Desktop navigation
navbarSrc = navbarSrc.replace(
  /<button\s*onClick=\{\(\) => handleNav\('servicios'\)\}\s*className=\{\`px-5 py-2\.5 rounded-full text-sm font-semibold tracking-tight transition-all duration-300 \$\{\s*activeTab === 'servicios'\s*\? 'bg-black text-white shadow-md scale-100'\s*: 'text-zinc-800 hover:text-black hover:bg-black\/10'\s*\}\`\}\s*>\s*Servicios\s*<\/button>/,
  `<button
            onClick={() => handleNav('servicios')}
            className={\`px-5 py-2.5 rounded-full text-sm font-semibold tracking-tight transition-all duration-300 \${
              activeTab === 'servicios'
                ? 'bg-black text-white shadow-md scale-100'
                : 'text-zinc-800 hover:text-black hover:bg-black/10'
            }\`}
          >
            Servicios
          </button>
          <button
            onClick={() => handleNav('store')}
            className={\`px-5 py-2.5 rounded-full text-sm font-semibold tracking-tight transition-all duration-300 \${
              activeTab === 'store'
                ? 'bg-black text-white shadow-md scale-100'
                : 'text-zinc-800 hover:text-black hover:bg-black/10'
            }\`}
          >
            Tienda
          </button>`
);

// Cart Icon desktop
navbarSrc = navbarSrc.replace(
  /<div className="h-6 w-px bg-zinc-200 mx-1"><\/div>/,
  `<button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 rounded-full text-zinc-800 hover:bg-zinc-100 transition-colors mr-1"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <div className="h-6 w-px bg-zinc-200 mx-1"></div>`
);

// Mobile navigation
navbarSrc = navbarSrc.replace(
  /<button\s*onClick=\{\(\) => handleNav\('servicios'\)\}\s*className=\{\`px-4 py-3 rounded-xl text-left font-semibold text-base transition-colors \$\{\s*activeTab === 'servicios' \? 'bg-black text-white' : 'text-zinc-800 hover:bg-zinc-100'\s*\}\`\}\s*>\s*Catálogo de Servicios\s*<\/button>/,
  `<button
              onClick={() => handleNav('servicios')}
              className={\`px-4 py-3 rounded-xl text-left font-semibold text-base transition-colors \${
                activeTab === 'servicios' ? 'bg-black text-white' : 'text-zinc-800 hover:bg-zinc-100'
              }\`}
            >
              Catálogo de Servicios
            </button>
            <button
              onClick={() => handleNav('store')}
              className={\`px-4 py-3 rounded-xl text-left font-semibold text-base transition-colors \${
                activeTab === 'store' ? 'bg-black text-white' : 'text-zinc-800 hover:bg-zinc-100'
              }\`}
            >
              Tienda
            </button>`
);

// Cart Icon Mobile (add next to mobile menu button)
navbarSrc = navbarSrc.replace(
  /<button\s*onClick=\{\(\) => setMobileMenuOpen\(!mobileMenuOpen\)\}\s*className="md:hidden p-2 rounded-xl text-zinc-800 hover:bg-zinc-100 focus:outline-none"/,
  `<div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 rounded-xl text-zinc-800 hover:bg-zinc-100 transition-colors"
          >
            <ShoppingBag className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-zinc-800 hover:bg-zinc-100 focus:outline-none"`
);

// Also need to close the div for the mobile menu button section
navbarSrc = navbarSrc.replace(
  /\{mobileMenuOpen \? <X className="w-6 h-6" \/> : <Menu className="w-6 h-6" \/>\}\s*<\/button>\s*<\/div>/,
  `{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>`
);


fs.writeFileSync('src/components/Navbar.tsx', navbarSrc);
console.log('Navbar store updated');
