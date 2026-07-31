const fs = require('fs');

let accountViewSrc = fs.readFileSync('src/components/AccountView.tsx', 'utf8');

accountViewSrc = accountViewSrc.replace(
  /<button\s*onClick=\{handleLogout\}\s*className="px-5 py-3 rounded-full bg-zinc-100 text-red-600 font-semibold text-xs hover:bg-red-50 transition-all border border-zinc-200 flex items-center gap-2"\s*>\s*<LogOut className="w-3\.5 h-3\.5" \/>\s*<span>Salir<\/span>\s*<\/button>/m,
  `<button
                  onClick={handleLogout}
                  className="px-6 py-3 rounded-full bg-white text-red-600 font-bold text-xs hover:bg-red-50 hover:text-red-700 transition-all border border-red-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>`
);

accountViewSrc = accountViewSrc.replace(
  /className="px-6 py-3 rounded-full bg-cyan-600 text-white font-semibold text-xs hover:bg-cyan-700 transition-all shadow-md flex items-center gap-2"/m,
  'className="px-6 py-3 rounded-full bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"'
);

fs.writeFileSync('src/components/AccountView.tsx', accountViewSrc);
console.log('Account buttons styled and updated');
