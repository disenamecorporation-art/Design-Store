import React, { useState, useEffect } from 'react';
import { Package, Search, CheckCircle2, Clock, Truck, Printer, Scissors, PackageCheck, FileSpreadsheet } from 'lucide-react';
import { motion } from 'motion/react';
import { Order, OrderStatus } from '../types';
import { supabase } from '../lib/supabase';

interface TrackingViewProps {
  initialTrackingCode?: string;
}

export const TrackingView: React.FC<TrackingViewProps> = ({ initialTrackingCode = '' }) => {
  const [trackingCode, setTrackingCode] = useState(initialTrackingCode);
  const [searchCode, setSearchCode] = useState(initialTrackingCode);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchCode.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.from('orders').select('*').eq('id', searchCode.trim()).single();
      
      if (error || !data) {
        setOrder(null);
        setError('No hemos encontrado un proyecto con este código. Verifica e intenta de nuevo.');
      } else {
        setOrder({
          id: data.id,
          status: data.status,
          customerName: data.customer_name,
          customerEmail: data.customer_email || '',
          projectName: data.project_name,
          totalAmount: Number(data.total_amount || 0),
          pointsUsed: Number(data.points_used || 0),
          paymentMethod: data.payment_method || (Number(data.points_used || 0) > 0 ? 'Puntos Design' : 'USD'),
          pointsAwarded: Boolean(data.points_awarded),
          createdAt: data.created_at,
          updatedAt: data.updated_at
        });
        setTrackingCode(searchCode.trim());
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al buscar la orden.');
    } finally {
      setLoading(false);
    }
  };
  

  // Run search if initial code is provided
  useEffect(() => {
    if (initialTrackingCode) {
      handleSearch();
    }
  }, [initialTrackingCode]);

  const getProgressWidth = (status: OrderStatus | string) => {
    switch (status) {
      case 'Cotizado':
      case 'COTIZADO': return '16.66%';
      case 'Pendiente por impresión': return '33.33%';
      case 'En proceso de impresión': return '50%';
      case 'EN PROCESO': return '50%';
      case 'En proceso de troquelado': return '66.66%';
      case 'Terminado': return '83.33%';
      case 'Despachado':
      case 'DESPACHADO': return '100%';
      default: return '0%';
    }
  };

  const steps: { status: OrderStatus; label: string; icon: React.FC<any> }[] = [
    { status: 'Cotizado', label: 'Cotizado', icon: Clock },
    { status: 'Pendiente por impresión', label: 'Pendiente Impresión', icon: FileSpreadsheet },
    { status: 'En proceso de impresión', label: 'En Impresión', icon: Printer },
    { status: 'En proceso de troquelado', label: 'Troquelado', icon: Scissors },
    { status: 'Terminado', label: 'Terminado', icon: PackageCheck },
    { status: 'Despachado', label: 'Despachado', icon: Truck },
  ];

  const currentStepIndex = order ? steps.findIndex(s => 
    s.status.toLowerCase() === (order.status || '').toLowerCase() ||
    (order.status === 'EN PROCESO' && s.status === 'En proceso de impresión') ||
    (order.status === 'COTIZADO' && s.status === 'Cotizado') ||
    (order.status === 'DESPACHADO' && s.status === 'Despachado')
  ) : -1;

  return (
    <div className="min-h-screen pt-40 lg:pt-48 pb-20 px-4 sm:px-8 bg-[#fbfbfd]">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header & Search */}
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900">
              Rastrea tu Proyecto
            </h1>
            <p className="text-lg text-zinc-500 font-medium max-w-xl mx-auto">
              Ingresa el código que te proporcionamos para conocer el estado actual de tu orden.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-md mx-auto relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-cyan-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Ej. 20517462"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="block w-full pl-12 pr-32 py-4 bg-white border border-zinc-200 rounded-full text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all shadow-sm font-medium text-lg"
            />
            <button
              type="submit"
              disabled={loading || !searchCode.trim()}
              className="absolute inset-y-1.5 right-1.5 px-6 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white rounded-full font-semibold transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Buscar'
              )}
            </button>
          </form>

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-rose-500 font-medium"
            >
              {error}
            </motion.p>
          )}
        </div>

        {/* Results */}
        {order && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-8 sm:p-12 overflow-hidden relative"
          >
            {/* Status Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 relative z-10">
              <div>
                <p className="text-sm font-bold text-cyan-600 tracking-widest uppercase mb-2">Orden #{order.id}</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">{order.projectName}</h2>
                <p className="text-zinc-500 font-medium mt-1">Cliente: {order.customerName}</p>
              </div>
              <div className="px-5 py-2.5 bg-zinc-50 rounded-full border border-zinc-100 flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${order.status === 'Despachado' || order.status === 'DESPACHADO' ? 'bg-emerald-500' : 'bg-cyan-500 animate-pulse'}`}></div>
                <span className="text-sm font-bold text-zinc-700">{order.status}</span>
              </div>
            </div>

            {/* Puntos Design Banner */}
            {(order.status === 'Despachado' || order.status === 'DESPACHADO' || order.pointsAwarded) && (
              <div className="mb-10 p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-cyan-500/10 rounded-2xl border border-amber-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-300 text-white flex items-center justify-center shadow-sm overflow-hidden p-1 shrink-0">
                    <img src="https://i.postimg.cc/9F2LvVpp/monedadesign.png" alt="Coin" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    {order.paymentMethod === 'Puntos Design' || (order.pointsUsed && order.pointsUsed > 0) ? (
                      <>
                        <h4 className="font-extrabold text-zinc-900 text-sm">¡Canje con Puntos Design Procesado!</h4>
                        <p className="text-xs text-zinc-600 font-medium">
                          Esta orden procesó un canje de <strong className="text-amber-800 font-bold">{order.pointsUsed || 0} Puntos Design</strong> al despacharse.
                        </p>
                      </>
                    ) : (
                      <>
                        <h4 className="font-extrabold text-zinc-900 text-sm">¡Puntos Design Acreditados!</h4>
                        <p className="text-xs text-zinc-600 font-medium">
                          Esta orden de <strong className="text-zinc-900">${order.totalAmount || 0} USD</strong> acreditó <strong className="text-amber-700 font-bold">+{Math.floor(order.totalAmount || 0)} Puntos Design</strong> a la cuenta del usuario.
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <span className="hidden sm:inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-200">
                  {order.paymentMethod === 'Puntos Design' ? 'Canje Procesado' : '1 USD = 1 Punto'}
                </span>
              </div>
            )}

            {/* Progress Bar Area */}
            <div className="relative pt-8 pb-4 z-10">
              {/* Background Track */}
              <div className="absolute top-1/2 left-0 w-full h-3 -translate-y-1/2 bg-zinc-100 rounded-full overflow-hidden">
                {/* Animated Fill */}
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: getProgressWidth(order.status) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${order.status === 'Despachado' || order.status === 'DESPACHADO' ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-400 to-cyan-500'}`}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between gap-1 overflow-x-auto pb-2 sm:pb-0">
                {steps.map((step, index) => {
                  const isCompleted = currentStepIndex >= index;
                  const isCurrent = currentStepIndex === index;
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.status} className="flex flex-col items-center min-w-[70px] sm:min-w-0 flex-1">
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center relative z-10 transition-colors duration-500 ${
                          isCompleted 
                            ? (order.status === 'Despachado' || order.status === 'DESPACHADO' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30')
                            : 'bg-white border-2 border-zinc-200 text-zinc-400'
                        }`}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        {isCompleted && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white flex items-center justify-center ${order.status === 'Despachado' || order.status === 'DESPACHADO' ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                          </motion.div>
                        )}
                      </motion.div>
                      <p className={`mt-3 text-[11px] sm:text-xs font-bold text-center leading-tight transition-colors duration-500 ${isCurrent ? 'text-zinc-900 font-black' : (isCompleted ? 'text-zinc-700' : 'text-zinc-400')}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
};
