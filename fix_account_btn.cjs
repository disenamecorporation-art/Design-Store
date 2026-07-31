const fs = require('fs');

let accountViewSrc = fs.readFileSync('src/components/AccountView.tsx', 'utf8');

accountViewSrc = accountViewSrc.replace(
  /<button\s*onClick=\{\(\) => setActiveTab\('cotizar'\)\}\s*className="px-6 py-3 rounded-full bg-black text-white font-semibold text-xs hover:bg-zinc-800 transition-all shadow-md flex items-center gap-2"\s*>\s*<Sparkles className="w-3\.5 h-3\.5 text-amber-400" \/>\s*<span>Nueva Cotización<\/span>\s*<\/button>/m,
  `{userSession.isAdmin && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="px-6 py-3 rounded-full bg-cyan-600 text-white font-semibold text-xs hover:bg-cyan-700 transition-all shadow-md flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Panel Admin</span>
                  </button>
                )}`
);

fs.writeFileSync('src/components/AccountView.tsx', accountViewSrc);
console.log('Account button fixed');
