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
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'USD' | 'Puntos Design'>('USD');
  const [newTotalAmount, setNewTotalAmount] = useState<string>('50');
  const [newPointsUsed, setNewPointsUsed] = useState<string>('500');
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
      (order.customerEmail && order.customerEmail.toLowerCase().includes(q)) ||
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
          customerEmail: order.customer_email || '',
          projectName: order.project_name,
          totalAmount: Number(order.total_amount || 0),
          pointsUsed: Number(order.points_used || 0),
          paymentMethod: order.payment_method || (Number(order.points_used || 0) > 0 ? 'Puntos Design' : 'USD'),
          pointsAwarded: Boolean(order.points_awarded),
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

    const numericAmount = paymentMethod === 'USD' ? Math.max(0, Number(newTotalAmount) || 0) : 0;
    const numericPointsUsed = paymentMethod === 'Puntos Design' ? Math.max(0, Number(newPointsUsed) || 0) : 0;

    const newOrder = {
      id: newOrderId.trim(),
      status: newStatus,
      customer_name: newCustomerName.trim(),
      customer_email: newCustomerEmail.trim(),
      project_name: newProjectName.trim(),
      total_amount: numericAmount,
      points_used: numericPointsUsed,
      payment_method: paymentMethod,
      points_awarded: false
    };

    const { error } = await supabase.from('orders').insert([newOrder]);
    
    if (error) {
      console.error(error);
      alert('Error: No se pudo crear la orden. ' + error.message);
      return;
    }

    // If initial status is Despachado, trigger points processing
    if (newStatus === 'Despachado') {
      if (paymentMethod === 'Puntos Design' && numericPointsUsed > 0) {
        await deductPointsForOrder(newOrder.id, newOrder.customer_email, newOrder.customer_name, numericPointsUsed);
      } else if (numericAmount > 0) {
        await awardPointsForOrder(newOrder.id, newOrder.customer_email, newOrder.customer_name, numericAmount);
      }
    }
    
    setNewOrderId('');
    setNewCustomerName('');
    setNewCustomerEmail('');
    setNewProjectName('');
    setNewTotalAmount('50');
    setNewPointsUsed('500');
    setNewStatus('Cotizado');
    
    setSuccessMsg(`Orden #${newOrder.id} creada correctamente (${paymentMethod === 'USD' ? `$${numericAmount} USD` : `${numericPointsUsed} Puntos Design`}).`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const deductPointsForOrder = async (orderId: string, email: string, customerName: string, pointsToDeduct: number) => {
    if (pointsToDeduct <= 0) return;

    try {
      let foundUser = null;

      if (email) {
        const { data } = await supabase.from('profiles').select('*').ilike('email', email.trim()).maybeSingle();
        if (data) foundUser = data;
      }

      if (!foundUser && customerName) {
        const { data } = await supabase.from('profiles').select('*').ilike('name', customerName.trim()).maybeSingle();
        if (data) foundUser = data;
      }

      if (foundUser) {
        const currentPoints = foundUser.points || 0;
        const newPoints = Math.max(0, currentPoints - pointsToDeduct);
        let newTier = 'Standard';
        if (newPoints >= 5000) newTier = 'Diamante Elite';
        else if (newPoints >= 2500) newTier = 'Platino Pro';
        else if (newPoints >= 1000) newTier = 'Oro Pro';
        else if (newPoints >= 500) newTier = 'Plata';

        await supabase.from('profiles').update({
          points: newPoints,
          tier: newTier
        }).eq('id', foundUser.id);

        await supabase.from('orders').update({
          points_awarded: true
        }).eq('id', orderId);

        setSuccessMsg(`🔻 ¡PUNTOS DESCONTADOS! Se descontaron -${pointsToDeduct} Puntos Design a ${foundUser.name}. Nuevo Saldo: ${newPoints} pts.`);
        setTimeout(() => setSuccessMsg(''), 7000);
      } else {
        await supabase.from('orders').update({
          points_awarded: true
        }).eq('id', orderId);

        setSuccessMsg(`Orden despachada (${pointsToDeduct} pts). No se encontró el usuario "${email || customerName}" para descontar puntos.`);
        setTimeout(() => setSuccessMsg(''), 7000);
      }
    } catch (e) {
      console.error('Error descontando puntos:', e);
    }
  };

  const awardPointsForOrder = async (orderId: string, email: string, customerName: string, amountUSD: number) => {
    const pointsToEarn = Math.floor(amountUSD);
    if (pointsToEarn <= 0) return;

    try {
      let foundUser = null;

      if (email) {
        const { data } = await supabase.from('profiles').select('*').ilike('email', email.trim()).maybeSingle();
        if (data) foundUser = data;
      }

      if (!foundUser && customerName) {
        const { data } = await supabase.from('profiles').select('*').ilike('name', customerName.trim()).maybeSingle();
        if (data) foundUser = data;
      }

      if (foundUser) {
        const currentPoints = foundUser.points || 0;
        const newPoints = currentPoints + pointsToEarn;
        let newTier = 'Standard';
        if (newPoints >= 5000) newTier = 'Diamante Elite';
        else if (newPoints >= 2500) newTier = 'Platino Pro';
        else if (newPoints >= 1000) newTier = 'Oro Pro';
        else if (newPoints >= 500) newTier = 'Plata';

        await supabase.from('profiles').update({
          points: newPoints,
          tier: newTier
        }).eq('id', foundUser.id);

        await supabase.from('orders').update({
          points_awarded: true
        }).eq('id', orderId);

        setSuccessMsg(`🎉 ¡PUNTOS ACREDITADOS! Se asignaron +${pointsToEarn} Puntos Design a ${foundUser.name} (${foundUser.email}). Nuevo Saldo: ${newPoints} pts.`);
        setTimeout(() => setSuccessMsg(''), 7000);
      } else {
        await supabase.from('orders').update({
          points_awarded: true
        }).eq('id', orderId);

        setSuccessMsg(`Orden despachada ($${amountUSD} USD). No se encontró un usuario registrado con el correo/nombre "${email || customerName}". Se acreditarán al vincular la cuenta.`);
        setTimeout(() => setSuccessMsg(''), 7000);
      }
    } catch (e) {
      console.error('Error acreditando puntos:', e);
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    const targetOrder = orders[id];
    const previousStatus = targetOrder?.status;
    const isDespachado = status === 'Despachado' || (status as string) === 'DESPACHADO';

    // optimistic update
    const updatedOrder: Order = { 
      ...targetOrder, 
      status, 
      updatedAt: new Date().toISOString() 
    };
    setOrders({ ...orders, [id]: updatedOrder });
    
    const { error } = await supabase.from('orders').update({ 
      status, 
      updated_at: new Date().toISOString() 
    }).eq('id', id);

    if (error) {
      console.error('Error actualizando estado en Supabase:', error);
      alert(`No se pudo actualizar el estado en Supabase (${error.message}).`);
      if (previousStatus) {
        setOrders({ ...orders, [id]: { ...orders[id], status: previousStatus } });
      }
      return;
    }

    // Auto Award or Deduct Puntos Design if status is Despachado
    if (isDespachado && targetOrder && !targetOrder.pointsAwarded) {
      if (targetOrder.paymentMethod === 'Puntos Design' || (targetOrder.pointsUsed && targetOrder.pointsUsed > 0)) {
        await deductPointsForOrder(id, targetOrder.customerEmail || '', targetOrder.customerName, targetOrder.pointsUsed || 0);
      } else {
        const amount = targetOrder.totalAmount || 0;
        if (amount > 0) {
          await awardPointsForOrder(id, targetOrder.customerEmail || '', targetOrder.customerName, amount);
        }
      }
    }
  };
  

  if (checkingAuth) {
    return (
      <div className="min-h-screen pt-12 pb-20 px-4 flex items-center justify-center bg-zinc-50">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-12 pb-20 px-4 flex items-center justify-center bg-zinc-50">
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
    <div className="min-h-screen pt-12 pb-20 px-4 sm:px-8 bg-[#fbfbfd]">
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

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Correo del Cliente</span>
                  <span className="text-[10px] text-amber-600 font-extrabold lowercase flex items-center gap-1">
                    <img src="https://i.postimg.cc/9F2LvVpp/monedadesign.png" alt="Coin" className="w-3.5 h-3.5 object-contain" referrerPolicy="no-referrer" />
                    <span>vincular puntos design</span>
                  </span>
                </label>
                <input 
                  type="email" 
                  value={newCustomerEmail} 
                  onChange={e => setNewCustomerEmail(e.target.value)}
                  placeholder="Ej. cliente@correo.com"
                  className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-base font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tipo de Pago / Operación</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('USD')}
                    className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                      paymentMethod === 'USD'
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                        : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    💵 Compra USD (Suma Puntos)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Puntos Design')}
                    className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                      paymentMethod === 'Puntos Design'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      <img src="https://i.postimg.cc/9F2LvVpp/monedadesign.png" alt="Coin" className="w-4 h-4 object-contain brightness-0 invert" referrerPolicy="no-referrer" />
                      <span>Canje de Puntos (Resta Puntos)</span>
                    </span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'USD' ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Monto de la Orden ($ USD)</span>
                    <span className="text-[10px] text-emerald-600 font-extrabold">+1 Punto x $1 USD</span>
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    step="any"
                    value={newTotalAmount} 
                    onChange={e => setNewTotalAmount(e.target.value)}
                    placeholder="Ej. 150"
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-base font-extrabold text-zinc-900 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Puntos Design a Descontar</span>
                    <span className="text-[10px] text-amber-600 font-extrabold">-Se descuenta al Despachar</span>
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    step="1"
                    value={newPointsUsed} 
                    onChange={e => setNewPointsUsed(e.target.value)}
                    placeholder="Ej. 500"
                    className="w-full px-5 py-4 bg-amber-50/50 border border-amber-200 rounded-2xl text-base font-extrabold text-amber-900 focus:bg-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all"
                    required
                  />
                </div>
              )}

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
                  <option value="Despachado">Fase 6: Despachado (Acredita Puntos Automáticamente)</option>
                </select>
              </div>
            </div>
            
            <button type="submit" className="w-full py-5 bg-zinc-900 text-white font-bold text-lg rounded-2xl hover:bg-black transition-all shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] hover:-translate-y-1">
              Generar Proyecto y Código de Tracking
            </button>
            {successMsg && (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-sm font-semibold rounded-2xl flex items-center justify-center gap-2 border border-emerald-200 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
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
                <div className="space-y-1.5">
                  <div className="flex items-center flex-wrap gap-3">
                    <span className="text-xs font-black tracking-widest uppercase text-cyan-700 bg-cyan-50 px-3 py-1.5 rounded-lg border border-cyan-200/60 shadow-xs">
                      #{order.id}
                    </span>
                    <h3 className="font-extrabold text-lg text-zinc-900">{order.projectName}</h3>
                    {order.paymentMethod === 'Puntos Design' || (order.pointsUsed && order.pointsUsed > 0) ? (
                      <span className="text-xs font-black px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                        <img src="https://i.postimg.cc/9F2LvVpp/monedadesign.png" alt="Coin" className="w-3.5 h-3.5 object-contain" referrerPolicy="no-referrer" />
                        <span>{order.pointsUsed || 0} Puntos Design</span>
                      </span>
                    ) : (
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ${order.totalAmount || 0} USD
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500 font-medium">
                    <p>Cliente: <span className="text-zinc-800 font-semibold">{order.customerName}</span></p>
                    {order.customerEmail && (
                      <p className="text-xs text-zinc-400">({order.customerEmail})</p>
                    )}
                  </div>
                  <div className="pt-1">
                    {order.paymentMethod === 'Puntos Design' || (order.pointsUsed && order.pointsUsed > 0) ? (
                      order.pointsAwarded || order.status === 'Despachado' ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                          🔻 -{order.pointsUsed || 0} Puntos Design Descontados
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                          Descontará -{order.pointsUsed || 0} pts al pasar a Despachado
                        </span>
                      )
                    ) : (
                      order.pointsAwarded || order.status === 'Despachado' ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                          <img src="https://i.postimg.cc/9F2LvVpp/monedadesign.png" alt="Coin" className="w-3.5 h-3.5 object-contain" referrerPolicy="no-referrer" />
                          <span>+{Math.floor(order.totalAmount || 0)} Puntos Design Acreditados</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md">
                          Acreditará +{Math.floor(order.totalAmount || 0)} pts al pasar a Despachado
                        </span>
                      )
                    )}
                  </div>
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
