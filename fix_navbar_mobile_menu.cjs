const fs = require('fs');
let src = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Replace mobile menu container
src = src.replace(
  /<div className="absolute top-full left-4 right-4 mt-2 glass-panel rounded-3xl p-6 shadow-xl md:hidden border border-zinc-200\/80 animate-in fade-in slide-in-from-top-4 duration-200">/,
  '<div className="absolute top-full left-4 right-4 mt-2 bg-white/95 backdrop-blur-3xl rounded-3xl p-6 shadow-2xl md:hidden border border-zinc-200 z-[100] animate-in fade-in slide-in-from-top-4 duration-200">'
);

// Enhance sub-navigation layout for mobile (make it responsive)
const oldSubNav = `<div className="max-w-7xl mx-auto mt-2 flex items-center justify-between gap-4 px-6">
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
      </div>`;

const newSubNav = `<div className="max-w-7xl mx-auto mt-2 flex items-center justify-between gap-3 px-2 sm:px-6">
        <div className="flex gap-2 sm:gap-3 items-center glass-panel bg-white/90 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full border border-zinc-200/50 shadow-sm shrink-0">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-fuchsia-500 transition-colors p-1">
            <Instagram className="w-4 h-4" />
          </a>
          <div className="w-px h-4 bg-zinc-300 hidden sm:block"></div>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-blue-600 transition-colors p-1 hidden sm:block">
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
            className="w-full pl-10 sm:pl-11 pr-4 py-2 sm:py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-zinc-200/50 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300 focus:bg-white placeholder:text-zinc-400 shadow-sm"
          />
          <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-cyan-500 transition-colors" />
        </div>
        
        <div className="hidden md:block w-[116px] opacity-0 shrink-0">Spacer</div>
      </div>`;

// Use simple split-join just in case indentation causes regex fail
src = src.split(oldSubNav).join(newSubNav);

fs.writeFileSync('src/components/Navbar.tsx', src);
console.log('Mobile menu updated');
