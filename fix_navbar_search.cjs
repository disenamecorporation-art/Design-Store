const fs = require('fs');

let navSrc = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// 1. Remove top Social Bar
navSrc = navSrc.replace(
  /<div className="max-w-7xl mx-auto flex justify-start gap-4 px-6 pb-2">[\s\S]*?<\/div>/,
  ""
);

// 2. Remove search bar from main nav right side
navSrc = navSrc.replace(
  /<div className="relative group">\s*<input\s*type="text"\s*placeholder="Buscar servicios\.\.\."[\s\S]*?<\/div>/,
  ""
);

// 3. Add search bar and social icons BELOW the main nav
const newSubNav = `
      {/* Sub Navigation: Search and Social */}
      <div className="max-w-7xl mx-auto mt-2 flex items-center justify-between gap-4 px-6">
        <div className="flex gap-3 items-center glass-panel bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-200/50 shadow-sm">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-fuchsia-500 transition-colors p-1">
            <Instagram className="w-4 h-4" />
          </a>
          <div className="w-px h-4 bg-zinc-300"></div>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-blue-600 transition-colors p-1">
            <Facebook className="w-4 h-4" />
          </a>
          <div className="w-px h-4 bg-zinc-300"></div>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-sky-500 transition-colors p-1">
            <Twitter className="w-4 h-4" />
          </a>
        </div>
        
        <div className="relative group flex-1 max-w-sm">
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-zinc-200/50 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300 focus:bg-white placeholder:text-zinc-400 shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-cyan-500 transition-colors" />
        </div>
        
        <div className="hidden sm:block opacity-0">Spacer</div>
      </div>
`;

navSrc = navSrc.replace(
  /<\/div>\s*\{\/\* Mobile dropdown \*\/\}/,
  `</div>
${newSubNav}
      {/* Mobile dropdown */}`
);

// We need to also add Store Admin to the desktop and mobile menus if isAdmin
navSrc = navSrc.replace(
  /<button\s*onClick=\{\(\) => \{ handleNav\('admin'\); setUserMenuOpen\(false\); \}\}\s*className=\{[\s\S]*?Admin Panel\s*<\/button>/,
  `
                      <button
                        onClick={() => { handleNav('admin'); setUserMenuOpen(false); }}
                        className={\`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 \${
                          activeTab === 'admin' ? 'bg-cyan-50 text-cyan-700' : 'text-zinc-600 hover:bg-zinc-50 hover:text-black'
                        }\`}
                      >
                        <Settings className="w-4 h-4" />
                        Admin CRM
                      </button>
                      <button
                        onClick={() => { handleNav('store-admin'); setUserMenuOpen(false); }}
                        className={\`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 \${
                          activeTab === 'store-admin' ? 'bg-indigo-50 text-indigo-700' : 'text-zinc-600 hover:bg-zinc-50 hover:text-black'
                        }\`}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Admin Tienda
                      </button>
`
);

navSrc = navSrc.replace(
  /<button\s*onClick=\{\(\) => handleNav\('admin'\)\}\s*className=\{`px-4 py-3 rounded-xl text-left font-semibold text-base transition-colors flex items-center gap-2[\s\S]*?Admin Panel\s*<\/button>/,
  `
                  <button
                    onClick={() => handleNav('admin')}
                    className={\`px-4 py-3 rounded-xl text-left font-semibold text-base transition-colors flex items-center gap-2 \${
                      activeTab === 'admin' ? 'bg-cyan-600 text-white' : 'text-zinc-800 hover:bg-zinc-100'
                    }\`}
                  >
                    <Settings className="w-4 h-4" />
                    Admin CRM
                  </button>
                  <button
                    onClick={() => handleNav('store-admin')}
                    className={\`px-4 py-3 rounded-xl text-left font-semibold text-base transition-colors flex items-center gap-2 \${
                      activeTab === 'store-admin' ? 'bg-indigo-600 text-white' : 'text-zinc-800 hover:bg-zinc-100'
                    }\`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Admin Tienda
                  </button>
`
);


fs.writeFileSync('src/components/Navbar.tsx', navSrc);
console.log('Navbar updated');
