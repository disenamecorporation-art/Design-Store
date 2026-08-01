import React, { useState, useEffect } from 'react';
import { TabType } from '../types';
import { supabase } from '../lib/supabase';
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck, LogOut, CheckCircle2, Gift, Plus, Trash2, Edit3, Settings, Package, DollarSign, Award, Users, RefreshCw } from 'lucide-react';

interface AccountViewProps {
  setActiveTab: (tab: TabType) => void;
  initialMode?: 'entrar' | 'registro' | 'cuenta';
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

export const AccountView: React.FC<AccountViewProps> = ({ setActiveTab, initialMode = 'entrar' }) => {
  const [isLogin, setIsLogin] = useState<boolean>(initialMode !== 'registro');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  // All users database in localStorage for admin management
  const [usersList, setUsersList] = useState<StoredUser[]>(() => {
    const saved = localStorage.getItem('design_store_all_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    const initial: StoredUser[] = [
      { id: '1', name: 'Administrador Pro', email: 'admin@designstore.ve', points: 5000, tier: 'Diamante Elite', isAdmin: true },
      { id: '2', name: 'Carlos Mendoza', email: 'carlos@empresa.com', points: 1250, tier: 'Oro Pro', isAdmin: false },
      { id: '3', name: 'Mariana Silva', email: 'mariana@diseno.ve', points: 850, tier: 'Plata', isAdmin: false }
    ];
    localStorage.setItem('design_store_all_users', JSON.stringify(initial));
    return initial;
  });

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
              role: ['admin@designstore.ve', 'legaintcorporation@gmail.com'].includes(formData.email.toLowerCase()) ? 'admin' : 'client'
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

  const handleUpdateUserPoints = (id: string, points: number) => { console.log(id, points); };
  const handleDeleteUser = (id: string) => { console.log(id); };

  const handleAddDemoAdmin = () => {
    const adminSession: UserSession = {
      name: 'Administrador Pro',
      email: 'admin@designstore.ve',
      points: 5000,
      tier: 'Diamante Elite',
      isAdmin: true
    };
    setUserSession(adminSession);
    localStorage.setItem('design_store_user_session', JSON.stringify(adminSession));
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-8 bg-[#fbfbfd] text-zinc-900 font-sans">
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

                  <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                    {userSession.points.toLocaleString()} <span className="text-amber-400 font-mono text-2xl sm:text-4xl">Puntos Design</span>
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
              <div className="backdrop-blur-xl bg-white/90 rounded-3xl p-6 border border-zinc-200/80 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-xs uppercase font-semibold">Órdenes Activas</span>
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-extrabold text-zinc-900">2</div>
                <span className="text-[11px] text-emerald-600 font-medium">En proceso de impresión 3D</span>
              </div>

              <div className="backdrop-blur-xl bg-white/90 rounded-3xl p-6 border border-zinc-200/80 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-xs uppercase font-semibold">Cotizaciones</span>
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-3xl font-extrabold text-zinc-900">7</div>
                <span className="text-[11px] text-zinc-500">Todas archivadas con éxito</span>
              </div>

              <div className="backdrop-blur-xl bg-white/90 rounded-3xl p-6 border border-zinc-200/80 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-xs uppercase font-semibold">Proyectos Completados</span>
                  <Award className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-3xl font-extrabold text-zinc-900">14</div>
                <span className="text-[11px] text-emerald-600 font-medium">Servicios entregados</span>
              </div>

              <div className="backdrop-blur-xl bg-white/90 rounded-3xl p-6 border border-zinc-200/80 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="text-xs uppercase font-semibold">Nivel de Cuenta</span>
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-3xl font-extrabold text-zinc-900">VIP</div>
                <span className="text-[11px] text-purple-600 font-medium">Soporte prioritario 24/7</span>
              </div>
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

            {/* Non-admin quick demo trigger */}
            {!userSession.isAdmin && (
              <div className="text-center pt-2">
                <button
                  onClick={handleAddDemoAdmin}
                  className="text-xs text-zinc-500 hover:text-zinc-900 underline transition-colors"
                >
                  ¿Eres Administrador? Haz clic aquí para activar el Panel Admin Demo 
                </button>
              </div>
            )}

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
              </div>

              {!isLogin && (
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

            <div className="text-center pt-2">
              <button
                onClick={handleAddDemoAdmin}
                className="text-xs text-zinc-500 hover:text-black underline transition-colors"
              >
                Acceder como Administrador Demo
              </button>
            </div>

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
