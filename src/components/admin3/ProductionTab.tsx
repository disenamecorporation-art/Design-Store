import React, { useState } from 'react';
import { Panel3ProductionOrder, Panel3Quote, Panel3InventoryItem, Panel3InventoryLog } from './types';
import { ClipboardList, Plus, Search, Printer, Trash2, Edit3, CheckCircle2, Clock, AlertCircle, Download, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { downloadAndPrintReport } from '../../lib/printUtils';

interface ProductionTabProps {
  orders: Panel3ProductionOrder[];
  setOrders: React.Dispatch<React.SetStateAction<Panel3ProductionOrder[]>>;
  quotes: Panel3Quote[];
  inventory: Panel3InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<Panel3InventoryItem[]>>;
  inventoryLogs: Panel3InventoryLog[];
  setInventoryLogs: React.Dispatch<React.SetStateAction<Panel3InventoryLog[]>>;
}

export const ProductionTab: React.FC<ProductionTabProps> = ({
  orders,
  setOrders,
  quotes,
  inventory,
  setInventory,
  inventoryLogs,
  setInventoryLogs
}) => {
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

  // Completion Modal State
  const [completingOrder, setCompletingOrder] = useState<Panel3ProductionOrder | null>(null);
  const [selectedMatId, setSelectedMatId] = useState('');
  const [deductQty, setDeductQty] = useState<number | ''>('');
  const [wasteQty, setWasteQty] = useState<number | ''>(0);

  // Dynamic Suggestion Logic for material deduction
  const getSuggestedDeduction = (item: Panel3InventoryItem, o: Panel3ProductionOrder) => {
    if (!item) return 0;
    const u = item.unit.toLowerCase();
    if (u === 'pliego' || u === 'unidad') {
      const q = quotes.find(qt => qt.code === o.quote_code);
      if (q) {
        const w = q.piece_width_cm || 0;
        const h = q.piece_length_cm || 0;
        const sep = q.separation_cm || 0;
        const mar = q.margin_cm || 0;
        const matW = item.width_cm || 100;
        const matL = item.length_cm || 100;
        const effW = Math.max(1, matW - 2 * mar);
        const effH = Math.max(1, matL - 2 * mar);
        const pW = w + sep;
        const pH = h + sep;
        const cols = Math.floor(effW / pW) || 1;
        const rows = Math.floor(effH / pH) || 1;
        const pPerSheet = cols * rows || 1;
        return Math.ceil(q.quantity / pPerSheet);
      }
      const sheetM2 = (item.width_cm * item.length_cm) / 10000 || 1;
      return Math.ceil(o.net_m2 / sheetM2) || 1;
    } else if (u === 'm2') {
      return o.net_m2;
    } else if (u === 'rollo') {
      const rollM2 = (item.width_cm * item.length_cm) / 10000 || 1;
      return Number((o.net_m2 / rollM2).toFixed(3));
    } else {
      if (item.category.toLowerCase().includes('3d') || u === 'g') {
        return o.copies * 5; // Estimado 5g por copia
      }
      return o.copies;
    }
  };

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

  const revertDeduction = async (ord: Panel3ProductionOrder) => {
    const log = inventoryLogs.find(l => l.reference === ord.order_code && l.log_type === 'Salida Orden');
    if (log) {
      const mat = inventory.find(i => i.id === log.material_id);
      if (mat) {
        const restoredStock = Number(mat.stock) + Number(log.quantity);
        await supabase.from('panel3_inventory').update({ stock: restoredStock }).eq('id', mat.id);
        setInventory(inventory.map(i => i.id === mat.id ? { ...i, stock: restoredStock } : i));
      }
      await supabase.from('panel3_inventory_logs').delete().eq('id', log.id);
      const updatedLogs = inventoryLogs.filter(l => l.id !== log.id);
      setInventoryLogs(updatedLogs);
      localStorage.setItem('panel3_inventory_logs', JSON.stringify(updatedLogs));
    }
  };

  const toggleStatus = async (ord: Panel3ProductionOrder) => {
    if (ord.status === 'En Proceso') {
      const relatedQuote = quotes.find(q => q.code === ord.quote_code);
      const defaultMat = inventory.find(i => i.id === relatedQuote?.material_id || i.name === relatedQuote?.material_name);
      
      setCompletingOrder(ord);
      if (defaultMat) {
        setSelectedMatId(defaultMat.id);
        setDeductQty(getSuggestedDeduction(defaultMat, ord));
      } else {
        setSelectedMatId('');
        setDeductQty('');
      }
      setWasteQty(0);
    } else {
      if (confirm('¿Deseas cambiar el estado a "En Proceso" y revertir el descuento de stock de esta orden?')) {
        await revertDeduction(ord);
        await supabase.from('panel3_production_orders').update({ status: 'En Proceso' }).eq('id', ord.id);
        setOrders(orders.map(o => o.id === ord.id ? { ...o, status: 'En Proceso' } : o));
      }
    }
  };

  const handleConfirmCompletion = async () => {
    if (!completingOrder) return;
    const targetMaterial = inventory.find(i => i.id === selectedMatId);
    if (!targetMaterial) {
      alert('Por favor selecciona un material válido del inventario.');
      return;
    }

    const cons = Number(deductQty) || 0;
    const waste = Number(wasteQty) || 0;
    const totalDeduction = cons + waste;

    if (totalDeduction < 0) {
      alert('La cantidad a descontar no puede ser negativa.');
      return;
    }

    if (targetMaterial.stock < totalDeduction) {
      if (!confirm(`El stock actual (${targetMaterial.stock} ${targetMaterial.unit}) es menor que el consumo solicitado (${totalDeduction} ${targetMaterial.unit}). ¿Deseas continuar de todas formas?`)) {
        return;
      }
    }

    const newStock = Math.max(0, Number(targetMaterial.stock) - totalDeduction);

    // 1. Update order status
    await supabase.from('panel3_production_orders').update({ status: 'Terminada' }).eq('id', completingOrder.id);
    
    // 2. Update material stock
    await supabase.from('panel3_inventory').update({ stock: newStock }).eq('id', targetMaterial.id);
    setInventory(inventory.map(i => i.id === targetMaterial.id ? { ...i, stock: newStock } : i));

    // 3. Register log
    const newLog: Panel3InventoryLog = {
      id: crypto.randomUUID(),
      material_id: targetMaterial.id,
      material_name: targetMaterial.name,
      log_type: 'Salida Orden',
      quantity: totalDeduction,
      unit: targetMaterial.unit,
      operator: completingOrder.operator,
      machine: completingOrder.machine,
      reference: completingOrder.order_code,
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase.from('panel3_inventory_logs').insert([newLog]).select().single();
      if (!error && data) {
        setInventoryLogs([data, ...inventoryLogs]);
      } else {
        const updatedLogs = [newLog, ...inventoryLogs];
        setInventoryLogs(updatedLogs);
        localStorage.setItem('panel3_inventory_logs', JSON.stringify(updatedLogs));
      }
    } catch (err) {
      const updatedLogs = [newLog, ...inventoryLogs];
      setInventoryLogs(updatedLogs);
      localStorage.setItem('panel3_inventory_logs', JSON.stringify(updatedLogs));
    }

    // 4. Update orders state
    setOrders(orders.map(o => o.id === completingOrder.id ? { ...o, status: 'Terminada' } : o));

    setCompletingOrder(null);
    alert(`Orden ${completingOrder.order_code} finalizada con éxito. Se descontaron ${totalDeduction} ${targetMaterial.unit} del material ${targetMaterial.name}.`);
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

      {/* Modal Confirmar Cierre de Orden y Consumo de Inventario */}
      {completingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-xl font-black text-zinc-900">Finalizar Orden e Imputar Inventario</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Orden: {completingOrder.order_code} — {completingOrder.project_name}</p>
              </div>
              <button
                onClick={() => setCompletingOrder(null)}
                className="text-zinc-400 hover:text-zinc-600 font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm text-zinc-700">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Material / Insumo Utilizado</label>
                <select
                  value={selectedMatId}
                  onChange={e => {
                    setSelectedMatId(e.target.value);
                    const foundMat = inventory.find(i => i.id === e.target.value);
                    if (foundMat) {
                      setDeductQty(getSuggestedDeduction(foundMat, completingOrder));
                    } else {
                      setDeductQty('');
                    }
                  }}
                  className="w-full rounded-xl border border-zinc-300 p-2 text-zinc-800 bg-white"
                >
                  <option value="">-- Selecciona el material descontable --</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.stock} {item.unit} disp.) - {item.category}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMatId && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                        Consumo Sugerido o Neto
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={deductQty}
                        onChange={e => setDeductQty(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full rounded-xl border border-zinc-300 p-2 text-zinc-800"
                        placeholder="Ej: 8"
                      />
                      <span className="text-[10px] text-zinc-400 mt-0.5 block">
                        Unidad: {inventory.find(i => i.id === selectedMatId)?.unit}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                        Merma / Calibración (Opcional)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={wasteQty}
                        onChange={e => setWasteQty(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full rounded-xl border border-zinc-300 p-2 text-zinc-800"
                        placeholder="Ej: 0.5"
                      />
                      <span className="text-[10px] text-zinc-400 mt-0.5 block">
                        Adicional por calibración o desperdicio
                      </span>
                    </div>
                  </div>

                  <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200">
                    <div className="flex justify-between items-center text-xs">
                      <span>Stock Actual:</span>
                      <span className="font-bold">{inventory.find(i => i.id === selectedMatId)?.stock} {inventory.find(i => i.id === selectedMatId)?.unit}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-red-600 mt-1">
                      <span>Total a Descontar:</span>
                      <span className="font-bold">
                        -{(Number(deductQty) || 0) + (Number(wasteQty) || 0)} {inventory.find(i => i.id === selectedMatId)?.unit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t pt-1 mt-1 font-bold">
                      <span>Nuevo Stock Estimado:</span>
                      <span>
                        {Math.max(0, (inventory.find(i => i.id === selectedMatId)?.stock || 0) - ((Number(deductQty) || 0) + (Number(wasteQty) || 0)))} {inventory.find(i => i.id === selectedMatId)?.unit}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4 border-t pt-3">
                <div>
                  <span className="block text-[10px] text-zinc-400 font-bold uppercase">Operador Responsable</span>
                  <span className="text-zinc-800 font-bold">{completingOrder.operator}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-400 font-bold uppercase">Máquina Utilizada</span>
                  <span className="text-zinc-800 font-bold">{completingOrder.machine}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => setCompletingOrder(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmCompletion}
                disabled={!selectedMatId}
                className={`px-5 py-2 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-colors ${
                  selectedMatId
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                Confirmar y Cerrar Orden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
