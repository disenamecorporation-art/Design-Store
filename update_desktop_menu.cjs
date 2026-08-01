const fs = require('fs');

let navbarSrc = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const regex = /\{session \? \(\s*<>\s*\{isAdmin && \([\s\S]*?Cerrar Sesión\s*<\/button>\s*<\/>\s*\) : \(\s*<>/;

const dropdownReplacement = `{session ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <User className="w-5 h-5 group-hover:animate-bounce" />
              </button>
              
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-zinc-100 py-3 z-50 animate-in fade-in slide-in-from-top-4 duration-200 origin-top-right">
                    <div className="px-4 pb-3 mb-2 border-b border-zinc-100">
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Mi Cuenta</p>
                      <p className="text-sm font-semibold text-zinc-900 truncate mt-1">{session.user?.email}</p>
                    </div>
                    
                    <div className="flex flex-col px-2">
                      {isAdmin && (
                        <button
                          onClick={() => { handleNav('admin'); setUserMenuOpen(false); }}
                          className={\`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 \${
                            activeTab === 'admin' ? 'bg-cyan-50 text-cyan-700' : 'text-zinc-600 hover:bg-zinc-50 hover:text-black'
                          }\`}
                        >
                          <Settings className="w-4 h-4" />
                          Admin Panel
                        </button>
                      )}
                      <button
                        onClick={() => { handleNav('cuenta'); setUserMenuOpen(false); }}
                        className={\`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 \${
                          activeTab === 'cuenta' ? 'bg-zinc-100 text-black' : 'text-zinc-600 hover:bg-zinc-50 hover:text-black'
                        }\`}
                      >
                        <User className="w-4 h-4" />
                        Mi Perfil
                      </button>
                      <button
                        onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                        className="px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-3 text-red-600 hover:bg-red-50 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>`;

navbarSrc = navbarSrc.replace(regex, dropdownReplacement);

fs.writeFileSync('src/components/Navbar.tsx', navbarSrc);
console.log('Desktop menu replaced!');
