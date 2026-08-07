import React, { useState } from 'react';
import { Panel3ProductionOrder, Panel3Quote } from './types';
import { ClipboardList, Plus, Search, Printer, Trash2, Edit3, CheckCircle2, Clock, AlertCircle, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { downloadAndPrintReport } from '../../lib/printUtils';

interface ProductionTabProps {
  orders: Panel3ProductionOrder[];
  setOrders: React.Dispatch<React.SetStateAction<Panel3ProductionOrder[]>>;
  quotes: Panel3Quote[];
}

export const ProductionTab: React.FC<ProductionTabProps> = ({ orders, setOrders, quotes }) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  // Search quote code
  const [searchCode, setSearchCode] = useState('');
  const [isRepetition, setIsRepetition] = useState(false);

  // Form
  const [quoteCode, setQuoteCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [operator, setOperator] = useState('Carlos Perez');
  const [machine, setMachine] = useState('Plotter Roland FJ-740');
  const [dieCutter, setDieCutter] = useState('Troquel Estándar');
  const [copies, setCopies] = useState<number | ''>(100);
  const [netM2, setNetM2] = useState<number | ''>(5);
  const [eyelets, setEyelets] = useState<number | ''>(0);
  const [bannerHolders, setBannerHolders] = useState<number | ''>(0);
  const [lamination, setLamination] = useState('Sin laminado');
  const [cutType, setCutType] = useState('Corte recto');
  const [priority, setPriority] = useState('Normal');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [arrivalDate, setArrivalDate] = useState(new Date().toISOString().split('T')[0]);
  const [orderType, setOrderType] = useState<'Nuevo' | 'Repetición'>('Nuevo');
  const [techNotes, setTechNotes] = useState('');

  // Printable Order Modal
  const [selectedPrintOrder, setSelectedPrintOrder] = useState<Panel3ProductionOrder | null>(null);
  const [showPrintReport, setShowPrintReport] = useState(false);

  // Auto calculate 5% waste
  const m2WithWaste = netM2 ? (Number(netM2) * 1.05).toFixed(2) : '0.00';

  // Search quote handler
  const handleSearchCode = () => {
    if (!searchCode.trim()) return;
    const found = quotes.find(q => q.code.toLowerCase() === searchCode.trim().toLowerCase());
    if (found) {
      setQuoteCode(found.code);
      setProjectName(`${found.job_name} - ${found.client_name}`);
      setCopies(found.quantity);
      const approxM2 = ((found.piece_width_cm * found.piece_length_cm * found.quantity) / 10000);
      setNetM2(Number(approxM2.toFixed(2)));
      setPriority(found.priority);
      if (found.delivery_date) setDeliveryDate(found.delivery_date);
      if (isRepetition) {
        setOrderType('Repetición');
      }
      alert(`Cotización ${found.code} encontrada y cargada en el formulario.`);
    } else {
      alert(`No se encontró ninguna cotización con el código "${searchCode}".`);
    }
  };

  const getNextOrderCode = () => {
    return `ORD${String(orders.length + 1).padStart(4, '0')}`;
  };

  const handleSaveOrder = async (status: 'En Proceso' | 'Terminada') => {
    if (!quoteCode && !projectName) {
      alert('Por favor selecciona una cotización o ingresa el nombre del proyecto.');
      return;
    }

    const orderData = {
      order_code: editingId ? (orders.find(o => o.id === editingId)?.order_code || getNextOrderCode()) : getNextOrderCode(),
      quote_code: quoteCode || 'DIRECTA',
      project_name: projectName || 'Orden de Taller',
      operator: operator.trim(),
      machine: machine.trim(),
      die_cutter: dieCutter.trim(),
      copies: Number(copies) || 1,
      net_m2: Number(netM2) || 0,
      m2_with_waste: Number(m2WithWaste) || 0,
      eyelets: Number(eyelets) || 0,
      banner_holders: Number(bannerHolders) || 0,
      lamination: lamination.trim(),
      cut_type: cutType.trim(),
      priority,
      delivery_date: deliveryDate,
      arrival_date: arrivalDate,
      order_type: orderType,
      is_repetition: isRepetition,
      tech_notes: techNotes.trim(),
      status,
    };

    if (editingId) {
      await supabase.from('panel3_production_orders').update(orderData).eq('id', editingId);
      setOrders(orders.map(o => o.id === editingId ? { ...o, ...orderData } : o));
      setEditingId(null);
    } else {
      const newObj: Panel3ProductionOrder = {
        id: crypto.randomUUID(),
        ...orderData,
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('panel3_production_orders').insert([newObj]).select().single();
      if (!error && data) {
        setOrders([data, ...orders]);
      } else {
        setOrders([newObj, ...orders]);
      }
    }

    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setSearchCode('');
    setIsRepetition(false);
    setQuoteCode('');
    setProjectName('');
    setOperator('Carlos Perez');
    setMachine('Plotter Roland FJ-740');
    setDieCutter('Troquel Estándar');
    setCopies(100);
    setNetM2(5);
    setEyelets(0);
    setBannerHolders(0);
    setLamination('Sin laminado');
    setCutType('Corte recto');
    setPriority('Normal');
    setDeliveryDate('');
    setArrivalDate(new Date().toISOString().split('T')[0]);
    setOrderType('Nuevo');
    setTechNotes('');
  };

  const handleEdit = (ord: Panel3ProductionOrder) => {
    setEditingId(ord.id);
    setQuoteCode(ord.quote_code);
    setProjectName(ord.project_name);
    setOperator(ord.operator);
    setMachine(ord.machine);
    setDieCutter(ord.die_cutter);
    setCopies(ord.copies);
    setNetM2(ord.net_m2);
    setEyelets(ord.eyelets);
    setBannerHolders(ord.banner_holders);
    setLamination(ord.lamination);
    setCutType(ord.cut_type);
    setPriority(ord.priority);
    setDeliveryDate(ord.delivery_date);
    setArrivalDate(ord.arrival_date);
    setOrderType(ord.order_type);
    setIsRepetition(ord.is_repetition);
    setTechNotes(ord.tech_notes);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta orden de producción?')) return;
    await supabase.from('panel3_production_orders').delete().eq('id', id);
    setOrders(orders.filter(o => o.id !== id));
  };

  const toggleStatus = async (ord: Panel3ProductionOrder) => {
    const newStatus = ord.status === 'En Proceso' ? 'Terminada' : 'En Proceso';
    await supabase.from('panel3_production_orders').update({ status: newStatus }).eq('id', ord.id);
    setOrders(orders.map(o => o.id === ord.id ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-amber-500" />
            Órdenes de Producción
          </h2>
          <p className="text-zinc-500 font-medium mt-1">
            Gestión técnica para operadores, máquinas, troquelado y mermas de impresión.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => setShowPrintReport(true)}
            className="px-5 py-3 bg-zinc-900 hover:bg-black text-white font-bold rounded-2xl shadow-md transition-all text-sm flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            Imprimir Reporte
          </button>
          {orders.length > 0 && (
            <button
              onClick={() => setSelectedPrintOrder(orders[0])}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-2xl shadow-md transition-all text-sm flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir Última Orden
            </button>
          )}
        </div>
      </div>

      {/* Buscar Código de Proyecto */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200 space-y-4">
        <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
          <Search className="w-4 h-4 text-amber-500" />
          Buscar Código de Proyecto / Cotización
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="text"
            value={searchCode}
            onChange={e => setSearchCode(e.target.value)}
            placeholder="Ingresa código (ej. ETQ0001)..."
            className="w-full sm:flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
          />
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-zinc-600 shrink-0">
            <input
              type="checkbox"
              checked={isRepetition}
              onChange={e => setIsRepetition(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 accent-amber-500"
            />
            Marcar como repetición del archivo encontrado
          </label>
          <button
            type="button"
            onClick={handleSearchCode}
            className="w-full sm:w-auto px-6 py-3 bg-zinc-900 hover:bg-black text-white font-bold rounded-xl text-sm transition-all shadow-sm"
          >
            Cargar Datos
          </button>
        </div>
      </div>

      {/* Formulario Órdenes */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200">
        <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-amber-500" />
          {editingId ? 'Editar Orden de Producción' : 'Nueva Orden de Producción'}
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Código de Cotización
              </label>
              <select
                value={quoteCode}
                onChange={e => {
                  setQuoteCode(e.target.value);
                  const selected = quotes.find(q => q.code === e.target.value);
                  if (selected) {
                    setProjectName(`${selected.job_name} - ${selected.client_name}`);
                    setCopies(selected.quantity);
                  }
                }}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
              >
                <option value="">-- Selecciona o escribe --</option>
                {quotes.map(q => (
                  <option key={q.id} value={q.code}>
                    [{q.code}] {q.job_name} ({q.client_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Nombre de Proyecto / Trabajo
              </label>
              <input
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="Ej. Etiquetas Cerveza Artesanal x 1,000 unids"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Operador
              </label>
              <input
                type="text"
                value={operator}
                onChange={e => setOperator(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Máquina / Plotter
              </label>
              <input
                type="text"
                value={machine}
                onChange={e => setMachine(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Troquel / Cuchilla
              </label>
              <input
                type="text"
                value={dieCutter}
                onChange={e => setDieCutter(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Copias / Piezas Totales
              </label>
              <input
                type="number"
                value={copies}
                onChange={e => setCopies(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                m² Neto A Producir
              </label>
              <input
                type="number"
                step="0.1"
                value={netM2}
                onChange={e => setNetM2(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider text-amber-700">
                m² con Merma (5% Auto)
              </label>
              <input
                type="text"
                readOnly
                value={`${m2WithWaste} m²`}
                className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm font-bold text-amber-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Ojales
              </label>
              <input
                type="number"
                value={eyelets}
                onChange={e => setEyelets(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Porta Pendones
              </label>
              <input
                type="number"
                value={bannerHolders}
                onChange={e => setBannerHolders(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Laminado / Acabado
              </label>
              <input
                type="text"
                value={lamination}
                onChange={e => setLamination(e.target.value)}
                placeholder="Ej. Laminado Mate UV"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Tipo de Corte
              </label>
              <input
                type="text"
                value={cutType}
                onChange={e => setCutType(e.target.value)}
                placeholder="Ej. Corte semicorte en plotter"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
              >
                <option value="Baja">Baja</option>
                <option value="Normal">Normal</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Tipo de Orden
              </label>
              <select
                value={orderType}
                onChange={e => setOrderType(e.target.value as any)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
              >
                <option value="Nuevo">Nuevo</option>
                <option value="Repetición">Repetición</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Fecha Llegada Pedido
              </label>
              <input
                type="date"
                value={arrivalDate}
                onChange={e => setArrivalDate(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Fecha Entrega Prometida
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={e => setDeliveryDate(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Otros Datos Técnicos / Observaciones
              </label>
              <textarea
                rows={2}
                value={techNotes}
                onChange={e => setTechNotes(e.target.value)}
                placeholder="Especificaciones adicionales de armado, empaque o entrega..."
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none resize-none"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => handleSaveOrder('En Proceso')}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-md transition-all text-sm"
            >
              Guardar Orden
            </button>
            <button
              type="button"
              onClick={() => handleSaveOrder('Terminada')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Producción Terminada
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-bold rounded-xl transition-all text-sm"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Órdenes */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200">
        <h3 className="text-xl font-bold text-zinc-900 mb-6">
          Órdenes de Producción Registradas ({orders.length})
        </h3>

        {orders.length === 0 ? (
          <div className="p-12 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <ClipboardList className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500 font-bold text-lg">Aún no hay órdenes de producción.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Orden / Cotiz.</th>
                  <th className="py-3 px-4">Proyecto</th>
                  <th className="py-3 px-4">Máquina</th>
                  <th className="py-3 px-4">Operador / Troquel</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Producción</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm font-medium text-zinc-700">
                {orders.map(ord => (
                  <tr key={ord.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-4 px-4 font-mono text-xs font-bold text-amber-800 bg-amber-50/60 rounded-lg">
                      {ord.order_code}
                      <span className="block text-[11px] text-zinc-400">{ord.quote_code}</span>
                    </td>
                    <td className="py-4 px-4 font-bold text-zinc-900">
                      {ord.project_name}
                      <span className="block text-xs font-semibold text-zinc-500">
                        {ord.copies} unid. ({ord.m2_with_waste} m²)
                      </span>
                    </td>
                    <td className="py-4 px-4 text-zinc-600 font-medium">{ord.machine}</td>
                    <td className="py-4 px-4 text-zinc-600">
                      {ord.operator}
                      <span className="block text-xs text-zinc-400">{ord.die_cutter}</span>
                    </td>
                    <td className="py-4 px-4 font-bold text-xs">
                      <span className={`px-2.5 py-1 rounded-full ${
                        ord.order_type === 'Repetición' ? 'bg-purple-100 text-purple-800' : 'bg-zinc-100 text-zinc-800'
                      }`}>
                        {ord.order_type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleStatus(ord)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                          ord.status === 'Terminada'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {ord.status === 'Terminada' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {ord.status}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedPrintOrder(ord)}
                          className="p-2 text-zinc-500 hover:text-zinc-900 rounded-lg transition-colors"
                          title="Imprimir Hoja de Ruta"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(ord)}
                          className="p-2 text-zinc-500 hover:text-amber-600 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ord.id)}
                          className="p-2 text-zinc-500 hover:text-red-600 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Imprimir Orden de Producción */}
      {selectedPrintOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-2xl font-black text-zinc-900">HOJA DE RUTA / ORDEN DE PRODUCCIÓN</h3>
                <p className="text-xs font-mono font-bold text-amber-600 mt-0.5">{selectedPrintOrder.order_code}</p>
              </div>
              <button
                onClick={() => setSelectedPrintOrder(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs print:hidden"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-medium text-zinc-700 bg-zinc-50 p-4 rounded-2xl">
              <div><strong>Proyecto:</strong> {selectedPrintOrder.project_name}</div>
              <div><strong>Cotización Ref:</strong> {selectedPrintOrder.quote_code}</div>
              <div><strong>Operador:</strong> {selectedPrintOrder.operator}</div>
              <div><strong>Máquina:</strong> {selectedPrintOrder.machine}</div>
              <div><strong>Copias / Piezas:</strong> {selectedPrintOrder.copies}</div>
              <div><strong>m² Neto + Merma (5%):</strong> {selectedPrintOrder.m2_with_waste} m²</div>
              <div><strong>Tipo de Corte:</strong> {selectedPrintOrder.cut_type}</div>
              <div><strong>Laminado:</strong> {selectedPrintOrder.lamination}</div>
              <div><strong>Fecha de Entrega:</strong> {selectedPrintOrder.delivery_date || 'N/A'}</div>
              <div><strong>Prioridad:</strong> {selectedPrintOrder.priority}</div>
            </div>

            {selectedPrintOrder.tech_notes && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
                <strong>Observaciones Técnicas:</strong> {selectedPrintOrder.tech_notes}
              </div>
            )}

            <div className="pt-4 border-t flex justify-end gap-3 print:hidden">
              <button
                onClick={() => {
                  const bodyHtml = `
                    <div style="background: #f4f4f5; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                      <h2 style="margin: 0 0 10px 0; font-size: 16px;">HOJA DE RUTA / ORDEN: ${selectedPrintOrder.order_code}</h2>
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
                        <div><strong>Proyecto:</strong> ${selectedPrintOrder.project_name}</div>
                        <div><strong>Cotización Ref:</strong> ${selectedPrintOrder.quote_code}</div>
                        <div><strong>Operador:</strong> ${selectedPrintOrder.operator}</div>
                        <div><strong>Máquina:</strong> ${selectedPrintOrder.machine}</div>
                        <div><strong>Copias / Piezas:</strong> ${selectedPrintOrder.copies}</div>
                        <div><strong>m² Neto + Merma (5%):</strong> ${selectedPrintOrder.m2_with_waste} m²</div>
                        <div><strong>Tipo de Corte:</strong> ${selectedPrintOrder.cut_type}</div>
                        <div><strong>Laminado:</strong> ${selectedPrintOrder.lamination}</div>
                        <div><strong>Fecha Entrega:</strong> ${selectedPrintOrder.delivery_date || 'N/A'}</div>
                        <div><strong>Prioridad:</strong> ${selectedPrintOrder.priority}</div>
                      </div>
                    </div>
                    ${selectedPrintOrder.tech_notes ? `<div style="background: #fef3c7; border: 1px solid #fde68a; padding: 15px; border-radius: 12px; font-size: 13px;"><strong>Observaciones Técnicas:</strong> ${selectedPrintOrder.tech_notes}</div>` : ''}
                  `;
                  downloadAndPrintReport(`Orden de Producción ${selectedPrintOrder.order_code}`, bodyHtml, `orden_${selectedPrintOrder.order_code}.html`);
                }}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-sm flex items-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" />
                Descargar Documento / Imprimir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reporte General de Producción Imprimible */}
      {showPrintReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-8 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-2xl font-black text-zinc-900">Reporte de Órdenes de Producción</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Generado el {new Date().toLocaleDateString()} — Total: {orders.length} órdenes</p>
              </div>
              <button
                onClick={() => setShowPrintReport(false)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs print:hidden"
              >
                Cerrar
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b font-bold text-zinc-600 bg-zinc-50">
                    <th className="py-2.5 px-3">N° Orden</th>
                    <th className="py-2.5 px-3">Cotización</th>
                    <th className="py-2.5 px-3">Proyecto</th>
                    <th className="py-2.5 px-3">Operador</th>
                    <th className="py-2.5 px-3">Máquina</th>
                    <th className="py-2.5 px-3">Copias</th>
                    <th className="py-2.5 px-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-zinc-800">
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="py-2.5 px-3 font-mono font-bold">{o.order_code}</td>
                      <td className="py-2.5 px-3 font-mono">{o.quote_code}</td>
                      <td className="py-2.5 px-3 font-bold">{o.project_name}</td>
                      <td className="py-2.5 px-3">{o.operator}</td>
                      <td className="py-2.5 px-3">{o.machine}</td>
                      <td className="py-2.5 px-3">{o.copies} unids.</td>
                      <td className="py-2.5 px-3 font-bold">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                          o.status === 'Terminada' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t flex justify-end gap-3 print:hidden">
              <button
                onClick={() => {
                  const bodyHtml = `
                    <table>
                      <thead>
                        <tr>
                          <th>N° Orden</th>
                          <th>Cotización</th>
                          <th>Proyecto</th>
                          <th>Operador</th>
                          <th>Máquina</th>
                          <th>Copias</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${orders.map(o => `
                          <tr>
                            <td><strong>${o.order_code}</strong></td>
                            <td>${o.quote_code}</td>
                            <td>${o.project_name}</td>
                            <td>${o.operator}</td>
                            <td>${o.machine}</td>
                            <td>${o.copies} unids.</td>
                            <td>${o.status}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  `;
                  downloadAndPrintReport('Reporte de Órdenes de Producción', bodyHtml, 'ordenes_produccion_taller.html');
                }}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-sm flex items-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" />
                Descargar Documento / Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
