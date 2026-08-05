const fs = require('fs');

let src = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const regex = /<div className="flex flex-col gap-2 pt-2 border-t border-zinc-200 mt-2">[\s\S]*?Cerrar Sesión\s*<\/button>\s*<\/div>/;

const repl = `<div className="flex flex-col gap-2 pt-2 border-t border-zinc-200 mt-2">
                {isAdmin && (
                  <>
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
                  </>
                )}
                <button
                  onClick={() => handleNav('cuenta')}
                  className={\`px-4 py-3 rounded-xl text-left font-semibold text-base transition-colors flex items-center gap-2 \${
                    activeTab === 'cuenta' ? 'bg-black text-white' : 'text-zinc-800 hover:bg-zinc-100'
                  }\`}
                >
                  <User className="w-4 h-4" />
                  Ir a Mi Perfil
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 rounded-xl text-left font-semibold text-base transition-colors text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>`;
              
src = src.replace(regex, repl);
// also clean up any hanging `)}` that might be around line 373 if it wasn't matched properly by the regex
// Actually, since we replaced from `<div className="flex flex-col gap-2 pt-2 border-t border-zinc-200 mt-2">` to `Cerrar Sesión </button> </div>`, the extra `)}` and `)}` were inside that block! So they should be gone.

fs.writeFileSync('src/components/Navbar.tsx', src);
console.log('Fixed mobile menu');
