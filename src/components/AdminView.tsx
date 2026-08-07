import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { Save, Plus, Search, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const AdminView: React.FC = () => {
  const [orders, setOrders] = useState<Record<string, Order>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Form states
  const [newOrderId, setNewOrderId] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newStatus, setNewStatus] = useState<OrderStatus>('Cotizado');
  
  const [successMsg, setSuccessMsg] = useState('');

  // Phase Filter States
  const [selectedPhase, setSelectedPhase] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const phaseOptions: { label: string; value: string; colorClass: string; badgeBg: string; activeBg: string }[] = [
    { label: 'Todas las Fases', value: 'Todas', colorClass: 'text-zinc-700', badgeBg: 'bg-zinc-200 text-zinc-800', activeBg: 'bg-zinc-900 text-white shadow-md' },
    { label: 'Cotizado', value: 'Cotizado', colorClass: 'text-amber-700', badgeBg: 'bg-amber-100 text-amber-800', activeBg: 'bg-amber-500 text-white shadow-md shadow-amber-500/20' },
    { label: 'Pendiente Impresión', value: 'Pendiente por impresión', colorClass: 'text-blue-700', badgeBg: 'bg-blue-100 text-blue-800', activeBg: 'bg-blue-600 text-white shadow-md shadow-blue-600/20' },
    { label: 'En Impresión', value: 'En proceso de impresión', colorClass: 'text-cyan-700', badgeBg: 'bg-cyan-100 text-cyan-800', activeBg: 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20' },
    { label: 'Troquelado', value: 'En proceso de troquelado', colorClass: 'text-fuchsia-700', badgeBg: 'bg-fuchsia-100 text-fuchsia-800', activeBg: 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/20' },
    { label: 'Terminado', value: 'Terminado', colorClass: 'text-indigo-700', badgeBg: 'bg-indigo-100 text-indigo-800', activeBg: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' },
    { label: 'Despachado', value: 'Despachado', colorClass: 'text-emerald-700', badgeBg: 'bg-emerald-100 text-emerald-800', activeBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' }
  ];

  const isOrderStatusMatchingPhase = (status: string, phaseValue: string) => {
    if (phaseValue === 'Todas') return true;
    const s = (status || '').toLowerCase();
    const p = phaseValue.toLowerCase();
    if (p === 'cotizado') return s === 'cotizado';
    if (p === 'pendiente por impresión') return s === 'pendiente por impresión';
    if (p === 'en proceso de impresión') return s === 'en proceso de impresión' || s === 'en proceso';
    if (p === 'en proceso de troquelado') return s === 'en proceso de troquelado';
    if (p === 'terminado') return s === 'terminado';
    if (p === 'despachado') return s === 'despachado';
    return s === p;
  };

  const getPhaseCount = (phaseValue: string) => {
    const allOrdersList: Order[] = Object.values(orders);
    if (phaseValue === 'Todas') return allOrdersList.length;
    return allOrdersList.filter((o: Order) => isOrderStatusMatchingPhase(o.status, phaseValue)).length;
  };

  const filteredOrdersList: Order[] = (Object.values(orders) as Order[]).reverse().filter((order: Order) => {
    const matchesPhase = isOrderStatusMatchingPhase(order.status, selectedPhase);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      order.id.toLowerCase().includes(q) || 
      order.customerName.toLowerCase().includes(q) || 
      order.projectName.toLowerCase().includes(q);
    return matchesPhase && matchesSearch;
  });

  
  const checkAdmin = async () => {
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

  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) {
      const ordersMap: Record<string, Order> = {};
      data.forEach(order => {
        ordersMap[order.id] = {
          id: order.id,
          status: order.status,
          customerName: order.customer_name,
          projectName: order.project_name,
          createdAt: order.created_at,
          updatedAt: order.updated_at,
        };
      });
      setOrders(ordersMap);
    }
  };

  useEffect(() => {
    fetchOrders();
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        fetchOrders();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderId.trim() || !newCustomerName.trim() || !newProjectName.trim()) return;

    const newOrder = {
      id: newOrderId.trim(),
      status: newStatus,
      customer_name: newCustomerName.trim(),
      project_name: newProjectName.trim(),
    };

    const { error } = await supabase.from('orders').insert([newOrder]);
    
    // In a real app we might rely on realtime or fetchOrders() but since realtime is on, it will update.
    if (error) {
      console.error(error);
      alert('Error: No se pudo crear la orden. ' + error.message);
      return;
    }
    
    setNewOrderId('');
    setNewCustomerName('');
    setNewProjectName('');
    setNewStatus('Cotizado');
    
    setSuccessMsg(`Orden #${newOrder.id} creada correctamente.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    const previousStatus = orders[id]?.status;
    // optimistic update
    const updatedOrder = { ...orders[id], status, updatedAt: new Date().toISOString() };
    setOrders({ ...orders, [id]: updatedOrder });
    
    const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) {
      console.error('Error actualizando estado en Supabase:', error);
      alert(`No se pudo actualizar el estado en Supabase (${error.message}). Recuerda ejecutar la actualización de la tabla en el Editor SQL de Supabase.`);
      // revert local state
      if (previousStatus) {
        setOrders({ ...orders, [id]: { ...orders[id], status: previousStatus } });
      }
    }
  };
  

  if (checkingAuth) {
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
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-8 bg-[#fbfbfd]">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Title */}
        <div className="text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight">Hola, Administrador Especial</h1>
          <p className="text-lg text-zinc-500 font-medium mt-3">Gestiona todos los proyectos y crea nuevos trackings desde tu panel.</p>
        </div>

        {/* Create Order Form - Prominent Full Width */}
        <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-zinc-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden">
          {/* Gradient top bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-blue-400" />
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg">
              <Plus className="w-6 h-6" />
            </div>
            Crear Nuevo Proyecto (Tracking)
          </h2>
          
          <form onSubmit={handleCreateOrder} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Código de Rastreo</label>
                <input 
                  type="text" 
                  value={newOrderId} 
                  onChange={e => setNewOrderId(e.target.value)}
                  placeholder="Ej. 20517462"
                  className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-base font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Nombre del Cliente</label>
                <input 
                  type="text" 
                  value={newCustomerName} 
                  onChange={e => setNewCustomerName(e.target.value)}
                  placeholder="Ej. Carlos Mendoza"
                  className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-base font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Descripción del Proyecto</label>
                <input 
                  type="text" 
                  value={newProjectName} 
                  onChange={e => setNewProjectName(e.target.value)}
                  placeholder="Ej. Diseño de Identidad Visual Corporativa"
                  className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-base font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Fase Inicial del Proyecto</label>
                <select 
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-base font-bold text-zinc-800 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all"
                >
                  <option value="Cotizado">Fase 1: Cotizado</option>
                  <option value="Pendiente por impresión">Fase 2: Pendiente por impresión</option>
                  <option value="En proceso de impresión">Fase 3: En proceso de impresión</option>
                  <option value="En proceso de troquelado">Fase 4: En proceso de troquelado</option>
                  <option value="Terminado">Fase 5: Terminado</option>
                  <option value="Despachado">Fase 6: Despachado</option>
                </select>
              </div>
            </div>
            
            <button type="submit" className="w-full py-5 bg-zinc-900 text-white font-bold text-lg rounded-2xl hover:bg-black transition-all shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] hover:-translate-y-1">
              Generar Proyecto y Código de Tracking
            </button>
            {successMsg && (
              <div className="p-4 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-2xl flex items-center justify-center gap-2 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
                {successMsg}
              </div>
            )}
          </form>
        </div>

        {/* Orders List */}
        <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-zinc-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-700 flex items-center justify-center border border-zinc-200">
                  <Search className="w-6 h-6" />
                </div>
                Proyectos por Fase ({Object.keys(orders).length})
              </h2>
              <p className="text-sm text-zinc-500 font-medium mt-1">
                Haz clic en cualquier fase para filtrar y gestionar las órdenes en ese estado.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por código, cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all"
              />
            </div>
          </div>

          {/* Phase Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 no-scrollbar">
            {phaseOptions.map((phase) => {
              const count = getPhaseCount(phase.value);
              const isActive = selectedPhase === phase.value;

              return (
                <button
                  key={phase.value}
                  onClick={() => setSelectedPhase(phase.value)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 border ${
                    isActive
                      ? `${phase.activeBg} border-transparent`
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                  }`}
                >
                  <span>{phase.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                      isActive ? 'bg-white/20 text-white' : phase.badgeBg
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Orders List Container */}
          <div className="space-y-4">
            {filteredOrdersList.map((order: any) => (
              <div
                key={order.id}
                className="p-6 border border-zinc-200/70 rounded-2xl bg-zinc-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:bg-white hover:shadow-lg hover:border-zinc-300 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center flex-wrap gap-3">
                    <span className="text-xs font-black tracking-widest uppercase text-cyan-700 bg-cyan-50 px-3 py-1.5 rounded-lg border border-cyan-200/60 shadow-xs">
                      #{order.id}
                    </span>
                    <h3 className="font-extrabold text-lg text-zinc-900">{order.projectName}</h3>
                  </div>
                  <p className="text-sm text-zinc-500 font-medium">
                    Cliente: <span className="text-zinc-800 font-semibold">{order.customerName}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Fase Actual:
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className={`w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                        order.status === 'Cotizado' || order.status === 'COTIZADO'
                          ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          : order.status === 'Pendiente por impresión'
                          ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
                          : order.status === 'En proceso de impresión' || order.status === 'EN PROCESO'
                          ? 'bg-cyan-50 text-cyan-800 border-cyan-300 hover:bg-cyan-100'
                          : order.status === 'En proceso de troquelado'
                          ? 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-300 hover:bg-fuchsia-100'
                          : order.status === 'Terminado'
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-300 hover:bg-indigo-100'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      }`}
                    >
                      <option value="Cotizado">Cotizado</option>
                      <option value="Pendiente por impresión">Pendiente por impresión</option>
                      <option value="En proceso de impresión">En proceso de impresión</option>
                      <option value="En proceso de troquelado">En proceso de troquelado</option>
                      <option value="Terminado">Terminado</option>
                      <option value="Despachado">Despachado</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {filteredOrdersList.length === 0 && Object.keys(orders).length > 0 && (
              <div className="text-center py-16 text-zinc-400 font-medium bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 space-y-2">
                <p className="text-zinc-600 font-bold text-base">No hay órdenes en la fase "{selectedPhase}"</p>
                {searchQuery && <p className="text-xs text-zinc-400">Prueba eliminando el filtro de búsqueda "{searchQuery}"</p>}
              </div>
            )}

            {Object.keys(orders).length === 0 && (
              <div className="text-center py-16 text-zinc-400 font-medium bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                Aún no hay proyectos registrados en el sistema.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
