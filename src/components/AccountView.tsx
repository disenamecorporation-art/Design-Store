import React, { useState, useEffect } from 'react';
import { TabType } from '../types';
import { supabase } from '../lib/supabase';
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck, LogOut, CheckCircle2, Gift, Plus, Trash2, Edit3, Settings, Package, DollarSign, Award, Users, RefreshCw, Search } from 'lucide-react';

interface AccountViewProps {
  setActiveTab: (tab: TabType) => void;
  initialMode?: 'entrar' | 'registro' | 'cuenta';
  setTrackingCodeParam?: (code: string) => void;
}

interface UserSession {
  name: string;
  email: string;
  points: number;
  tier: string;
  isAdmin: boolean;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  points: number;
  tier: string;
  isAdmin: boolean;
}

export const AccountView: React.FC<AccountViewProps> = ({ setActiveTab, initialMode = 'entrar', setTrackingCodeParam }) => {
  const [isLogin, setIsLogin] = useState<boolean>(initialMode !== 'registro');
  const [isRecovering, setIsRecovering] = useState<boolean>(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Real-time dynamic user orders states
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [selectedStatFilter, setSelectedStatFilter] = useState<'all' | 'active' | 'quotes' | 'completed'>('all');
  const [projectSearch, setProjectSearch] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referredBy: ''
  });

  // Simulated authentication state
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('design_store_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // All users database for admin management, loaded dynamically from Supabase
  const [usersList, setUsersList] = useState<StoredUser[]>([]);

  const fetchRealUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name', { ascending: true });
      if (!error && data) {
        const mappedUsers: StoredUser[] = data.map((profile: any) => ({
          id: profile.id,
          name: profile.name || 'Usuario',
          email: profile.email || '',
          points: profile.points || 0,
          tier: profile.tier || 'Básico',
          isAdmin: profile.role === 'admin'
        }));
        setUsersList(mappedUsers);
      }
    } catch (e) {
      console.error('Error fetching real users:', e);
    }
  };

  useEffect(() => {
    if (userSession?.isAdmin) {
      fetchRealUsers();
    }
  }, [userSession?.isAdmin]);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editPointsValue, setEditPointsValue] = useState<number>(0);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setIsLogin(initialMode !== 'registro');
  }, [initialMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

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

  const fetchUserOrders = async (email: string, name: string) => {
    if (!email) return;
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`customer_email.ilike.${email},customer_name.ilike.${name}`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUserOrders(data);
      }
    } catch (e) {
      console.error('Error fetching user orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (userSession) {
      fetchUserOrders(userSession.email, userSession.name);
    }
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
          points: 5,
          tier: 'Básico'
        };
        setUserSession({
          name: dummyProfile.name,
          email: dummyProfile.email,
          points: dummyProfile.points,
          tier: dummyProfile.tier,
          isAdmin: dummyProfile.role === 'admin'
        });
        fetchUserOrders(dummyProfile.email, dummyProfile.name);
        return;
      }

      if (data) {
        const uSession = {
          name: data.name,
          email: data.email,
          points: data.points,
          tier: data.tier,
          isAdmin: data.role === 'admin'
        };
        setUserSession(uSession);
        fetchUserOrders(data.email, data.name);
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
              role: ['admin@designstore.ve', 'designstore.ve@gmail.com', 'designstorevzla@gmail.com'].includes(formData.email.toLowerCase()) 
                ? 'admin' 
                : ['dsoperador01@gmail.com', 'dsoperador02@gmail.com', 'dsoperador03@gmail.com', 'dsoperador04@gmail.com'].includes(formData.email.toLowerCase())
                  ? 'operator'
                  : 'client',
              referred_by: formData.referredBy || ''
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!formData.email) {
      setErrorMsg('Por favor ingrese su correo electrónico.');
      return;
    }
    setLoadingAuth(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setSuccessMsg('Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico.');
    } catch (error: any) {
      setErrorMsg(error.message || 'Ocurrió un error al enviar el correo de recuperación.');
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccessMsg('Contraseña actualizada con éxito.');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setSuccessMsg('');
      }, 2500);
    } catch (error: any) {
      setErrorMsg(error.message || 'Ocurrió un error al actualizar la contraseña.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserSession(null);
    setActiveTab('inicio');
  };

  const handleUpdateUserPoints = async (id: string, points: number) => {
    try {
      let newTier = 'Básico';
      if (points >= 5000) newTier = 'Diamante Elite';
      else if (points >= 2500) newTier = 'Platino Pro';
      else if (points >= 1000) newTier = 'Oro Pro';
      else if (points >= 500) newTier = 'Plata';

      const { error } = await supabase
        .from('profiles')
        .update({ points, tier: newTier })
        .eq('id', id);

      if (!error) {
        setSuccessMsg('Puntos actualizados exitosamente en la base de datos.');
        setEditingUserId(null);
        fetchRealUsers();
        // Clear success msg after 3s
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg('Error al actualizar puntos: ' + error.message);
      }
    } catch (e: any) {
      setErrorMsg('Error al actualizar puntos: ' + e.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (!error) {
        setSuccessMsg('Usuario eliminado exitosamente.');
        fetchRealUsers();
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg('Error al eliminar usuario: ' + error.message);
      }
    } catch (e: any) {
      setErrorMsg('Error al eliminar usuario: ' + e.message);
    }
  };

  return (
    <div className="min-h-screen pt-12 pb-24 px-4 sm:px-8 bg-[#fbfbfd] text-zinc-900 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {userSession ? (
          /* Professional User & Admin Dashboard */
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* Top Dashboard Bar */}
            <div className="backdrop-blur-2xl bg-white/90 rounded-[32px] p-6 sm:p-8 border border-zinc-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center text-2xl font-bold shadow-lg shrink-0">
                  {userSession.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Panel Pro</span>
                    {userSession.isAdmin && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                        Administrador
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mt-0.5">
                    ¡Hola, {userSession.name}!
                  </h1>
                  <p className="text-xs text-zinc-500">{userSession.email} • {userSession.tier}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchUserOrders(userSession.email, userSession.name)}
                  disabled={loadingOrders}
                  className="p-3 rounded-full bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center disabled:opacity-50"
                  title="Actualizar proyectos"
                >
                  <RefreshCw className={`w-4 h-4 text-zinc-500 ${loadingOrders ? 'animate-spin' : ''}`} />
                </button>
                {userSession.isAdmin && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="px-6 py-3 rounded-full bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Panel Admin</span>
                  </button>
                )}
                <button
                  onClick={() => { setShowChangePasswordModal(true); setErrorMsg(''); setSuccessMsg(''); }}
                  className="px-5 py-3 rounded-full bg-white text-zinc-700 font-bold text-xs hover:bg-zinc-50 transition-all border border-zinc-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Seguridad</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 rounded-full bg-white text-red-600 font-bold text-xs hover:bg-red-50 hover:text-red-700 transition-all border border-red-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>

            {/* Puntos Design - Gorgeous Gift Card Section */}
            <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-r from-zinc-900 via-zinc-800 to-black p-8 sm:p-12 text-white shadow-2xl border border-zinc-700">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 via-purple-500/10 to-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-amber-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                    <Gift className="w-4 h-4" />
                    <span>Puntos Design • Gift Card Club</span>
                  </div>

                  <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight flex items-center gap-3 flex-wrap">
                    <img src="https://i.postimg.cc/9F2LvVpp/monedadesign.png" alt="Coin" className="w-10 h-10 sm:w-14 sm:h-14 object-contain inline-block shrink-0" referrerPolicy="no-referrer" />
                    <span>{userSession.points.toLocaleString()} <span className="text-amber-400 font-mono text-2xl sm:text-4xl">Puntos Design</span></span>
                  </h2>

                  <p className="text-zinc-300 text-sm sm:text-base max-w-lg leading-relaxed">
                    Acumula Puntos Design con cada compra de servicios que realices. 
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs">
                      <span className="text-zinc-400 block uppercase">Nivel Actual</span>
                      <span className="font-bold text-amber-300 text-sm">{userSession.tier}</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/15 text-center space-y-4 shadow-xl">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400 text-black flex items-center justify-center mx-auto shadow-lg">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-300 uppercase tracking-widest font-mono">Código de Socio VIP</span>
                    <div className="text-lg font-mono font-bold tracking-widest text-white mt-1">DSV-VIP-{userSession.name.substring(0,4).toUpperCase()}-2026</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div 
                onClick={() => setSelectedStatFilter(selectedStatFilter === 'active' ? 'all' : 'active')}
                className={`backdrop-blur-xl bg-white/90 rounded-3xl p-6 border shadow-sm space-y-2 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md select-none ${
                  selectedStatFilter === 'active' 
                    ? 'ring-2 ring-blue-600/30 bg-blue-50/20 border-blue-400' 
                    : 'border-zinc-200/80 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-xs uppercase font-semibold">Órdenes Activas</span>
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-extrabold text-zinc-900">
                  {userOrders.filter(o => 
                    ['pendiente por impresión', 'en proceso de impresión', 'en proceso de troquelado', 'terminado', 'en proceso']
                      .includes(o.status.toLowerCase())
                  ).length}
                </div>
                <span className="text-[11px] text-blue-600 font-medium">Ver cola de impresión activa</span>
              </div>

              <div 
                onClick={() => setSelectedStatFilter(selectedStatFilter === 'quotes' ? 'all' : 'quotes')}
                className={`backdrop-blur-xl bg-white/90 rounded-3xl p-6 border shadow-sm space-y-2 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md select-none ${
                  selectedStatFilter === 'quotes' 
                    ? 'ring-2 ring-amber-600/30 bg-amber-50/20 border-amber-400' 
                    : 'border-zinc-200/80 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-xs uppercase font-semibold">Cotizaciones</span>
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-3xl font-extrabold text-zinc-900">
                  {userOrders.filter(o => 
                    ['cotizado'].includes(o.status.toLowerCase())
                  ).length}
                </div>
                <span className="text-[11px] text-amber-600 font-medium">Ver proyectos cotizados</span>
              </div>

              <div 
                onClick={() => setSelectedStatFilter(selectedStatFilter === 'completed' ? 'all' : 'completed')}
                className={`backdrop-blur-xl bg-white/90 rounded-3xl p-6 border shadow-sm space-y-2 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md select-none ${
                  selectedStatFilter === 'completed' 
                    ? 'ring-2 ring-emerald-600/30 bg-emerald-50/20 border-emerald-400' 
                    : 'border-zinc-200/80 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-xs uppercase font-semibold">Proyectos Completados</span>
                  <Award className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-3xl font-extrabold text-zinc-900">
                  {userOrders.filter(o => 
                    ['despachado'].includes(o.status.toLowerCase())
                  ).length}
                </div>
                <span className="text-[11px] text-emerald-600 font-medium">Ver servicios entregados</span>
              </div>

              <div 
                onClick={() => setSelectedStatFilter('all')}
                className={`backdrop-blur-xl bg-white/90 rounded-3xl p-6 border shadow-sm space-y-2 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md select-none ${
                  selectedStatFilter === 'all' 
                    ? 'ring-2 ring-purple-600/30 bg-purple-50/20 border-purple-400' 
                    : 'border-zinc-200/80 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-xs uppercase font-semibold">Nivel de Cuenta</span>
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-3xl font-extrabold text-zinc-900">{userSession.tier}</div>
                <span className="text-[11px] text-purple-600 font-medium">Soporte prioritario y club</span>
              </div>
            </div>

            {/* HISTORIAL DE PROYECTOS DEL USUARIO (User's Project History) */}
            <div className="backdrop-blur-2xl bg-white/90 rounded-[32px] p-6 sm:p-8 border border-zinc-200/80 shadow-[0_15px_40px_rgba(0,0,0,0.04)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-zinc-700" />
                    <span>Mis Proyectos y Órdenes</span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {selectedStatFilter === 'all' && 'Mostrando todo tu historial de cotizaciones y órdenes'}
                    {selectedStatFilter === 'active' && 'Mostrando tus órdenes de producción activas'}
                    {selectedStatFilter === 'quotes' && 'Mostrando tus solicitudes de cotización'}
                    {selectedStatFilter === 'completed' && 'Mostrando tus proyectos terminados y despachados'}
                  </p>
                </div>

                {/* Search Bar inside History */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Buscar por proyecto o código..."
                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-full text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-zinc-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {loadingOrders ? (
                <div className="py-12 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-zinc-400 animate-spin mx-auto" />
                  <p className="text-xs text-zinc-500">Cargando tus proyectos en tiempo real...</p>
                </div>
              ) : userOrders.length === 0 ? (
                <div className="py-16 text-center max-w-sm mx-auto space-y-4">
                  <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-400">
                    <Package className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-zinc-800 text-sm">No se encontraron proyectos</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Aún no tienes proyectos registrados con nosotros. ¡Solicita una cotización para empezar!
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('cotizar')}
                    className="px-5 py-2.5 rounded-full bg-black text-white font-bold text-xs hover:bg-zinc-800 transition-all shadow-sm"
                  >
                    Solicitar Cotización Ahora
                  </button>
                </div>
              ) : userOrders.filter(o => {
                const matchesSearch = 
                  o.id.toLowerCase().includes(projectSearch.toLowerCase()) ||
                  (o.project_name && o.project_name.toLowerCase().includes(projectSearch.toLowerCase()));

                if (!matchesSearch) return false;

                if (selectedStatFilter === 'active') {
                  return ['pendiente por impresión', 'en proceso de impresión', 'en proceso de troquelado', 'terminado', 'en proceso']
                    .includes(o.status.toLowerCase());
                }
                if (selectedStatFilter === 'quotes') {
                  return ['cotizado'].includes(o.status.toLowerCase());
                }
                if (selectedStatFilter === 'completed') {
                  return ['despachado'].includes(o.status.toLowerCase());
                }

                return true;
              }).length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  Ningún proyecto coincide con los filtros aplicados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                        <th className="py-3 px-4">Código / Proyecto</th>
                        <th className="py-3 px-4">Fecha</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4">Monto / Método</th>
                        <th className="py-3 px-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-xs font-medium">
                      {userOrders
                        .filter(o => {
                          const matchesSearch = 
                            o.id.toLowerCase().includes(projectSearch.toLowerCase()) ||
                            (o.project_name && o.project_name.toLowerCase().includes(projectSearch.toLowerCase()));

                          if (!matchesSearch) return false;

                          if (selectedStatFilter === 'active') {
                            return ['pendiente por impresión', 'en proceso de impresión', 'en proceso de troquelado', 'terminado', 'en proceso']
                              .includes(o.status.toLowerCase());
                          }
                          if (selectedStatFilter === 'quotes') {
                            return ['cotizado'].includes(o.status.toLowerCase());
                          }
                          if (selectedStatFilter === 'completed') {
                            return ['despachado'].includes(o.status.toLowerCase());
                          }

                          return true;
                        })
                        .map((o) => {
                          const isQuote = ['cotizado'].includes(o.status.toLowerCase());
                          const isActive = ['pendiente por impresión', 'en proceso de impresión', 'en proceso de troquelado', 'terminado', 'en proceso'].includes(o.status.toLowerCase());

                          return (
                            <tr key={o.id} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="py-4 px-4">
                                <div className="font-bold text-zinc-950 font-mono tracking-wider">{o.id}</div>
                                <div className="text-zinc-600 mt-0.5">{o.project_name}</div>
                              </td>
                              <td className="py-4 px-4 text-zinc-500 font-medium">
                                {new Date(o.created_at || Date.now()).toLocaleDateString('es-VE', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </td>
                              <td className="py-4 px-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  isQuote ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                  isActive ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                  'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    isQuote ? 'bg-amber-500' :
                                    isActive ? 'bg-blue-500 animate-pulse' :
                                    'bg-emerald-500'
                                  }`}></span>
                                  <span>{o.status}</span>
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="font-extrabold text-zinc-900">
                                  {o.payment_method === 'Puntos Design' || (o.points_used && o.points_used > 0) ? (
                                    <span className="text-amber-600 font-bold">{Number(o.points_used || 0).toLocaleString()} pts</span>
                                  ) : (
                                    <span>${Number(o.total_amount || 0).toLocaleString()} USD</span>
                                  )}
                                </div>
                                <div className="text-[10px] text-zinc-400 font-medium mt-0.5">
                                  {o.payment_method === 'Puntos Design' || (o.points_used && o.points_used > 0) ? 'Canje Design Club' : 'Pago en Divisas'}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-right font-medium">
                                <button
                                  onClick={() => {
                                    if (setTrackingCodeParam) {
                                      setTrackingCodeParam(o.id);
                                    }
                                    setActiveTab('tracking');
                                  }}
                                  className="px-4 py-2 rounded-full bg-zinc-100 hover:bg-black hover:text-white text-zinc-800 font-bold text-[11px] transition-all border border-zinc-200 hover:border-black"
                                >
                                  Ver Tracking
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ADMIN PANEL: Only if user is admin */}
            {userSession.isAdmin && (
              <div className="backdrop-blur-2xl bg-zinc-900 text-white rounded-[32px] p-6 sm:p-10 border border-zinc-800 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-amber-400" />
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">Panel de Administración • Puntos Design</h2>
                      <p className="text-xs text-zinc-400">Gestiona usuarios, añade, edita o elimina puntos de fidelidad en tiempo real.</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono border border-emerald-500/30">
                    Modo Admin Activo
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-400">
                        <th className="py-3 px-4">Usuario</th>
                        <th className="py-3 px-4">Correo</th>
                        <th className="py-3 px-4">Puntos Design</th>
                        <th className="py-3 px-4">Nivel</th>
                        <th className="py-3 px-4 text-right">Acciones Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800 text-sm">
                      {usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-zinc-800/50 transition-colors">
                          <td className="py-4 px-4 font-semibold text-white flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold">
                              {u.name.charAt(0)}
                            </div>
                            {u.name} {u.isAdmin && <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.5 rounded font-bold">Admin</span>}
                          </td>
                          <td className="py-4 px-4 text-zinc-300 font-mono text-xs">{u.email}</td>
                          <td className="py-4 px-4 font-mono font-bold text-amber-400">
                            {editingUserId === u.id ? (
                              <input
                                type="number"
                                defaultValue={u.points}
                                onChange={(e) => setEditPointsValue(Number(e.target.value))}
                                className="w-24 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-white text-xs"
                              />
                            ) : (
                              `${u.points.toLocaleString()} pts`
                            )}
                          </td>
                          <td className="py-4 px-4 text-zinc-300 text-xs">{u.tier}</td>
                          <td className="py-4 px-4 text-right space-x-2">
                            {editingUserId === u.id ? (
                              <button
                                onClick={() => handleUpdateUserPoints(u.id, editPointsValue)}
                                className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500"
                              >
                                Guardar
                              </button>
                            ) : (
                              <button
                                onClick={() => { setEditingUserId(u.id); setEditPointsValue(u.points); }}
                                className="px-3 py-1 bg-zinc-800 text-amber-400 border border-zinc-700 rounded-lg text-xs font-semibold hover:bg-zinc-700"
                              >
                                Editar Puntos
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="px-3 py-1 bg-red-950/60 text-red-400 border border-red-900 rounded-lg text-xs font-semibold hover:bg-red-900/80"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Change Password Modal */}
            {showChangePasswordModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-white rounded-[32px] border border-zinc-200/80 shadow-[0_25px_60px_rgba(0,0,0,0.15)] p-6 sm:p-8 max-w-md w-full relative z-10 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-zinc-700" />
                      <span>Actualizar Contraseña</span>
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Ingresa tu nueva clave de acceso para actualizar tu cuenta.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 rounded-2xl bg-red-50 text-red-600 text-xs text-center font-medium border border-red-100">
                      {errorMsg}
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-700 text-xs text-center font-medium border border-emerald-100 animate-bounce">
                      {successMsg}
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Nueva Contraseña</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400" />
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => { setNewPassword(e.target.value); setErrorMsg(''); }}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black rounded-2xl text-sm text-zinc-950"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Confirmar Nueva Contraseña</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400" />
                        <input
                          type="password"
                          required
                          value={confirmNewPassword}
                          onChange={(e) => { setConfirmNewPassword(e.target.value); setErrorMsg(''); }}
                          placeholder="Repite la clave"
                          className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black rounded-2xl text-sm text-zinc-950"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => { setShowChangePasswordModal(false); setErrorMsg(''); setSuccessMsg(''); }}
                        className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 transition-colors text-zinc-700 font-bold text-xs rounded-full"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={updatingPassword}
                        className="flex-1 py-3 bg-black hover:bg-zinc-800 transition-colors text-white font-bold text-xs rounded-full flex items-center justify-center gap-1"
                      >
                        {updatingPassword ? 'Guardando...' : 'Cambiar Clave'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        ) : isRecovering ? (
          /* Password Recovery Form */
          <div className="max-w-md mx-auto backdrop-blur-2xl bg-white/80 rounded-[36px] p-8 sm:p-10 border border-white/90 shadow-[0_25px_60px_rgba(0,0,0,0.12)] space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-gradient-to-tr from-emerald-400/20 to-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center space-y-3 relative z-10">
              <div className="w-16 h-16 rounded-3xl bg-black text-white flex items-center justify-center mx-auto p-3.5 shadow-2xl">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
                Recuperar Clave
              </h2>
              <p className="text-xs text-zinc-500">
                Ingresa tu correo para recibir un enlace real de restablecimiento.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-50/90 backdrop-blur-md border border-red-200 text-red-600 text-xs font-medium text-center">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/90 backdrop-blur-md border border-emerald-200 text-emerald-700 text-xs font-medium text-center">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400" />
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@correo.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black text-sm text-zinc-900 transition-all shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingAuth}
                className="w-full py-4 rounded-full bg-black text-white font-semibold text-sm hover:bg-zinc-800 transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-transform duration-200 flex items-center justify-center gap-2 mt-4 group animate-pulse"
              >
                <span>{loadingAuth ? 'Enviando...' : 'Enviar enlace de recuperación'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => { setIsRecovering(false); setErrorMsg(''); setSuccessMsg(''); }}
                className="w-full py-3 rounded-full bg-zinc-100 text-zinc-700 font-semibold text-xs hover:bg-zinc-200 transition-all text-center mt-2 block"
              >
                Volver a Iniciar Sesión
              </button>
            </form>
          </div>
        ) : (
          /* Login / Register Forms with Gorgeous Glass */
          <div className="max-w-md mx-auto backdrop-blur-2xl bg-white/80 rounded-[36px] p-8 sm:p-10 border border-white/90 shadow-[0_25px_60px_rgba(0,0,0,0.12)] space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 relative overflow-hidden">
            
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-gradient-to-tr from-emerald-400/20 to-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header & Toggle */}
            <div className="text-center space-y-3 relative z-10">
              <div className="w-16 h-16 rounded-3xl bg-black text-white flex items-center justify-center mx-auto p-3.5 shadow-2xl animate-bounce">
                <img src="https://i.postimg.cc/sfSLbNKq/designisotipo.png" alt="Logo" className="w-full h-full object-contain filter invert" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h2>
              <p className="text-xs text-zinc-500">
                {isLogin ? 'Accede a tu Club Puntos Design Pro' : 'Regístrate para gestionar tus proyectos en Venezuela'}
              </p>

              {/* Animated Toggle */}
              <div className="flex items-center bg-zinc-200/70 backdrop-blur-md p-1.5 rounded-full border border-white/60 mt-4 shadow-inner">
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setErrorMsg(''); }}
                  className={`flex-1 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    isLogin ? 'bg-black text-white shadow-md' : 'text-zinc-700 hover:text-black'
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); setErrorMsg(''); }}
                  className={`flex-1 py-2.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    !isLogin ? 'bg-black text-white shadow-md' : 'text-zinc-700 hover:text-black'
                  }`}
                >
                  Registro
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-50/90 backdrop-blur-md border border-red-200 text-red-600 text-xs font-medium text-center animate-shake">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/90 backdrop-blur-md border border-emerald-200 text-emerald-700 text-xs font-medium text-center animate-in fade-in">
                {successMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {!isLogin && (
                <div className="space-y-1.5 animate-in fade-in duration-300">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Tu Nombre"
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black text-sm text-zinc-900 transition-all shadow-sm"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400" />
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@correo.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black text-sm text-zinc-900 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400" />
                  <input 
                    type="password" 
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black text-sm text-zinc-900 transition-all shadow-sm"
                  />
                </div>
                {isLogin && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => { setIsRecovering(true); setErrorMsg(''); setSuccessMsg(''); }}
                      className="text-xs font-bold text-zinc-500 hover:text-black transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}
              </div>

              {!isLogin && (
                <>
                  <div className="space-y-1.5 animate-in fade-in duration-300">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Confirmar Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400" />
                      <input 
                        type="password" 
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black text-sm text-zinc-900 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 animate-in fade-in duration-300">
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-600 font-bold flex items-center gap-1">
                      <span>¿Te refirió un amigo? (Correo Opcional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-4 h-4 text-amber-500/75" />
                      <input 
                        type="email" 
                        name="referredBy"
                        value={formData.referredBy}
                        onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                        placeholder="correo@amigo.com"
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-zinc-900 transition-all shadow-sm font-medium"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button with Bounce/Hover Effect */}
              <button
                type="submit"
                className="w-full py-4 rounded-full bg-black text-white font-semibold text-sm hover:bg-zinc-800 transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-transform duration-200 flex items-center justify-center gap-2 mt-4 group"
              >
                <span>{isLogin ? 'Entrar al Sistema' : 'Completar Registro'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>



            <div className="text-center">
              <p className="text-[11px] text-zinc-400">
                * Sistema protegido con cifrado SSL y Puntos Design Club.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
