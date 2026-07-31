const fs = require('fs');

let navbarSrc = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

if (!navbarSrc.includes('import { supabase } from')) {
  navbarSrc = navbarSrc.replace(
    /import \{ Search, Menu, X, Phone \} from 'lucide-react';/m,
    `import { Search, Menu, X, Phone, User, LogOut, Settings } from 'lucide-react';\nimport { supabase } from '../lib/supabase';\nimport { useEffect, useState } from 'react';`
  );
}

navbarSrc = navbarSrc.replace(
  /export const Navbar: React\.FC<NavbarProps> = \(\{ activeTab, setActiveTab \}\) => \{/,
  `export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdmin(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkAdmin(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (currentSession: any) => {
    if (currentSession) {
      const { data } = await supabase.from('profiles').select('role').eq('id', currentSession.user.id).single();
      if (data && data.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveTab('inicio');
    setMobileMenuOpen(false);
  };`
);

navbarSrc = navbarSrc.replace(
  /<button\s*onClick=\{\(\) => handleNav\('entrar'\)\}\s*className=\{\`px-5 py-2\.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 border \$\{\s*activeTab === 'entrar'\s*\? 'bg-black text-white border-black shadow-sm'\s*: 'bg-white\/80 text-zinc-800 border-zinc-200 hover:bg-zinc-100'\s*\}\`\}\s*>\s*Entrar\s*<\/button>\s*<button\s*onClick=\{\(\) => handleNav\('registro'\)\}\s*className=\{\`px-5 py-2\.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 shadow-md \$\{\s*activeTab === 'registro'\s*\? 'bg-emerald-600 text-white'\s*: 'bg-black text-white hover:bg-zinc-800 hover:scale-\[1\.02\]'\s*\}\`\}\s*>\s*Registro\s*<\/button>/m,
  `{session ? (
            <>
              {isAdmin && (
                <button
                  onClick={() => handleNav('admin')}
                  className={\`px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 border flex items-center gap-1.5 \${
                    activeTab === 'admin'
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                      : 'bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-100'
                  }\`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Admin Panel
                </button>
              )}
              <button
                onClick={() => handleNav('cuenta')}
                className={\`px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 border flex items-center gap-1.5 \${
                  activeTab === 'cuenta'
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-white/80 text-zinc-800 border-zinc-200 hover:bg-zinc-100'
                }\`}
              >
                <User className="w-3.5 h-3.5" />
                Ir a Mi Perfil
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 bg-zinc-100 text-red-600 hover:bg-red-50 border border-zinc-200 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNav('entrar')}
                className={\`px-5 py-2.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 border \${
                  activeTab === 'entrar'
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-white/80 text-zinc-800 border-zinc-200 hover:bg-zinc-100'
                }\`}
              >
                Entrar
              </button>
              <button
                onClick={() => handleNav('registro')}
                className={\`px-5 py-2.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 shadow-md \${
                  activeTab === 'registro'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-black text-white hover:bg-zinc-800 hover:scale-[1.02]'
                }\`}
              >
                Registro
              </button>
            </>
          )}`
);

navbarSrc = navbarSrc.replace(
  /<div className="grid grid-cols-2 gap-2 pt-2">\s*<button\s*onClick=\{\(\) => handleNav\('entrar'\)\}\s*className=\{\`px-4 py-3 rounded-xl text-center font-semibold text-sm transition-colors border \$\{\s*activeTab === 'entrar' \? 'bg-black text-white border-black' : 'bg-white text-zinc-800 border-zinc-200'\s*\}\`\}\s*>\s*Entrar\s*<\/button>\s*<button\s*onClick=\{\(\) => handleNav\('registro'\)\}\s*className=\{\`px-4 py-3 rounded-xl text-center font-semibold text-sm transition-colors \$\{\s*activeTab === 'registro' \? 'bg-emerald-600 text-white' : 'bg-black text-white'\s*\}\`\}\s*>\s*Registro\s*<\/button>\s*<\/div>/m,
  `{session ? (
              <div className="flex flex-col gap-2 pt-2 border-t border-zinc-200 mt-2">
                {isAdmin && (
                  <button
                    onClick={() => handleNav('admin')}
                    className={\`px-4 py-3 rounded-xl text-left font-semibold text-base transition-colors flex items-center gap-2 \${
                      activeTab === 'admin' ? 'bg-cyan-600 text-white' : 'text-zinc-800 hover:bg-zinc-100'
                    }\`}
                  >
                    <Settings className="w-4 h-4" />
                    Admin Panel
                  </button>
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
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200 mt-2">
                <button
                  onClick={() => handleNav('entrar')}
                  className={\`px-4 py-3 rounded-xl text-center font-semibold text-sm transition-colors border \${
                    activeTab === 'entrar' ? 'bg-black text-white border-black' : 'bg-white text-zinc-800 border-zinc-200'
                  }\`}
                >
                  Entrar
                </button>
                <button
                  onClick={() => handleNav('registro')}
                  className={\`px-4 py-3 rounded-xl text-center font-semibold text-sm transition-colors \${
                    activeTab === 'registro' ? 'bg-emerald-600 text-white' : 'bg-black text-white'
                  }\`}
                >
                  Registro
                </button>
              </div>
            )}`
);

fs.writeFileSync('src/components/Navbar.tsx', navbarSrc);
console.log('Navbar updated');
