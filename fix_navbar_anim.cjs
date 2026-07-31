const fs = require('fs');

let navbarSrc = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

navbarSrc = navbarSrc.replace(
  /className=\{\`px-4 py-2\.5 rounded-full text-xs font-semibold transition-all duration-200 border flex items-center gap-1\.5 \$\{\s*activeTab === 'cuenta'\s*\? 'bg-black text-white border-black shadow-sm'\s*: 'bg-white\/80 text-zinc-800 border-zinc-200 hover:bg-zinc-100'\s*\}\`\}/g,
  `className={\`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 border flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-md \${
                  activeTab === 'cuenta'
                    ? 'bg-black text-white border-black shadow-md'
                    : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300'
                }\`}`
);

navbarSrc = navbarSrc.replace(
  /className="px-4 py-2\.5 rounded-full text-xs font-semibold transition-all duration-200 bg-zinc-100 text-red-600 hover:bg-red-50 border border-zinc-200 flex items-center gap-1\.5"/g,
  'className="px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-100 flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-sm"'
);

navbarSrc = navbarSrc.replace(
  /className=\{\`px-4 py-2\.5 rounded-full text-xs font-semibold transition-all duration-200 border flex items-center gap-1\.5 \$\{\s*activeTab === 'admin'\s*\? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'\s*: 'bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-100'\s*\}\`\}/g,
  `className={\`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 border flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-md \${
                    activeTab === 'admin'
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-md'
                      : 'bg-white text-cyan-700 border-cyan-200 hover:bg-cyan-50'
                  }\`}`
);

fs.writeFileSync('src/components/Navbar.tsx', navbarSrc);
console.log('Navbar animated buttons fixed');
