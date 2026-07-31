const fs = require('fs');

const accountViewSrc = fs.readFileSync('src/components/AccountView.tsx', 'utf8');

const newAccountViewSrc = accountViewSrc.replace(
  /const handleSubmit = \(e: React\.FormEvent\) => \{[\s\S]*?const handleAddDemoAdmin/m,
  `import { supabase } from '../lib/supabase';
  
  const [loadingAuth, setLoadingAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user);
      } else {
        setUserSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (user: any) => {
    try {
      let { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      
      // Fallback if no profile is found but auth exists
      if (error && error.code === 'PGRST116') {
        const dummyProfile = {
          name: user.user_metadata?.full_name || 'Usuario',
          email: user.email,
          role: 'client',
          points: 0,
          tier: 'Standard'
        };
        setUserSession({
          name: dummyProfile.name,
          email: dummyProfile.email,
          points: dummyProfile.points,
          tier: dummyProfile.tier,
          isAdmin: dummyProfile.role === 'admin'
        });
        return;
      }

      if (data) {
        setUserSession({
          name: data.name,
          email: data.email,
          points: data.points,
          tier: data.tier,
          isAdmin: data.role === 'admin'
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoadingAuth(true);

    if (!formData.email || !formData.password) {
      setErrorMsg('Por favor complete todos los campos obligatorios.');
      setLoadingAuth(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        setSuccessMsg('Inicio de sesión exitoso.');
      } else {
        if (!formData.name) {
          setErrorMsg('El nombre es obligatorio para crear una cuenta.');
          setLoadingAuth(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setErrorMsg('Las contraseñas no coinciden.');
          setLoadingAuth(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              role: formData.email.toLowerCase() === 'admin@designstore.ve' ? 'admin' : 'client'
            }
          }
        });
        if (error) throw error;
        setSuccessMsg('Cuenta creada exitosamente. Puedes iniciar sesión ahora.');
        setIsLogin(true);
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Ocurrió un error en la autenticación.');
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserSession(null);
    setActiveTab('inicio');
  };

  const handleAddDemoAdmin`
);

let finalAccountView = newAccountViewSrc.replace(
  "import { Sparkles",
  "import { supabase } from '../lib/supabase';\nimport { Sparkles"
);

// We need to clean up the extra import we added in the replace
finalAccountView = finalAccountView.replace(
  /import \{ supabase \} from '\.\.\/lib\/supabase';\s*const \[loadingAuth/m,
  "const [loadingAuth"
);

fs.writeFileSync('src/components/AccountView.tsx', finalAccountView);

console.log('AccountView rewritten');
