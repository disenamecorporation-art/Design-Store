const fs = require('fs');

let adminViewSrc = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

adminViewSrc = adminViewSrc.replace(
  /const \[authenticated, setAuthenticated\] = useState\(false\);\n  const \[password, setPassword\] = useState\(''\);/m,
  `const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);`
);

adminViewSrc = adminViewSrc.replace(
  /const fetchOrders = async/m,
  `const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (data && data.role === 'admin') {
        setIsAdmin(true);
      }
    }
    setCheckingAuth(false);
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  const fetchOrders = async`
);

adminViewSrc = adminViewSrc.replace(
  /const handleLogin = \(e: React\.FormEvent\) => \{[\s\S]*?alert\('Contraseña incorrecta'\);\n    \}\n  \};/m,
  ''
);

adminViewSrc = adminViewSrc.replace(
  /if \(!authenticated\) \{[\s\S]*?return \([\s\S]*?Acceso Especial[\s\S]*?Ingresar[\s\S]*?<\/button>[\s\S]*?<\/form>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\);\n  \}/m,
  `if (checkingAuth) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center bg-zinc-50">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center bg-zinc-50">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">Acceso Denegado</h2>
          <p className="text-zinc-500">No tienes permisos de administrador. Por favor, inicia sesión con una cuenta autorizada desde la pestaña Cuenta.</p>
        </div>
      </div>
    );
  }`
);

fs.writeFileSync('src/components/AdminView.tsx', adminViewSrc);
console.log('Admin auth fixed');
