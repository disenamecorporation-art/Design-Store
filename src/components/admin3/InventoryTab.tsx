import React, { useState } from 'react';
import { Panel3InventoryItem, Panel3InventoryLog } from './types';
import { Package, Plus, Trash2, Edit3, AlertTriangle, Printer, Layers, Box, CheckSquare, Search, Download, ArrowUpRight, ArrowDownLeft, Calendar, User, Hammer } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { downloadAndPrintReport } from '../../lib/printUtils';

interface InventoryTabProps {
  inventory: Panel3InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<Panel3InventoryItem[]>>;
  inventoryLogs: Panel3InventoryLog[];
  setInventoryLogs: React.Dispatch<React.SetStateAction<Panel3InventoryLog[]>>;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  inventory,
  setInventory,
  inventoryLogs,
  setInventoryLogs
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [artCode, setArtCode] = useState('');
  const [category, setCategory] = useState('Material imprimible');
  const [unit, setUnit] = useState('pliego');
  const [stock, setStock] = useState<number | ''>(10);
  const [widthCm, setWidthCm] = useState<number | ''>(100);
  const [lengthCm, setLengthCm] = useState<number | ''>(100);
  const [pricePerM2, setPricePerM2] = useState<number | ''>(15);
  const [damagedM2, setDamagedM2] = useState<number | ''>(0);

  // Section: Quick register damage
  const [selectedDamageCode, setSelectedDamageCode] = useState('');
  const [damageInput, setDamageInput] = useState<number | ''>('');

  // Print Report Modal
  const [showPrintReport, setShowPrintReport] = useState(false);

  // Sub-tab Navigation
  const [subTab, setSubTab] = useState<'materiales' | 'movimientos'>('materiales');

  // Reabastecimiento Form State
  const [replenishMatId, setReplenishMatId] = useState('');
  const [replenishQty, setReplenishQty] = useState<number | ''>('');
  const [replenishUser, setReplenishUser] = useState('Carlos Perez');

  // Salida Directa Form State
  const [directMatId, setDirectMatId] = useState('');
  const [directQty, setDirectQty] = useState<number | ''>('');
  const [directUser, setDirectUser] = useState('Carlos Perez');
  const [directMachineArea, setDirectMachineArea] = useState('Administración / Oficinas');

  // History search & filters
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'Entrada' | 'Salida Directa' | 'Salida Orden'>('all');

  // Generate code MAT0001
  const getNextMatCode = () => {
    const num = inventory.length + 1;
    return `MAT${String(num).padStart(4, '0')}`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const itemData = {
      code: editingId ? (inventory.find(i => i.id === editingId)?.code || getNextMatCode()) : getNextMatCode(),
      art_code: artCode.trim(),
      name: name.trim(),
      category,
      unit,
      stock: Number(stock) || 0,
      width_cm: Number(widthCm) || 0,
      length_cm: Number(lengthCm) || 0,
      price_per_m2: Number(pricePerM2) || 0,
      damaged_m2: Number(damagedM2) || 0,
    };

    if (editingId) {
      await supabase.from('panel3_inventory').update(itemData).eq('id', editingId);
      setInventory(inventory.map(i => i.id === editingId ? { ...i, ...itemData } : i));
      setEditingId(null);
    } else {
      const newObj: Panel3InventoryItem = {
        id: crypto.randomUUID(),
        ...itemData,
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('panel3_inventory').insert([newObj]).select().single();
      if (!error && data) {
        setInventory([data, ...inventory]);
      } else {
        setInventory([newObj, ...inventory]);
      }
    }

    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setArtCode('');
    setCategory('Material imprimible');
    setUnit('pliego');
    setStock(10);
    setWidthCm(100);
    setLengthCm(100);
    setPricePerM2(15);
    setDamagedM2(0);
  };

  const handleEdit = (item: Panel3InventoryItem) => {
    setEditingId(item.id);
    setName(item.name);
    setArtCode(item.art_code || '');
    setCategory(item.category || 'Material imprimible');
    setUnit(item.unit || 'pliego');
    setStock(item.stock);
    setWidthCm(item.width_cm);
    setLengthCm(item.length_cm);
    setPricePerM2(item.price_per_m2);
    setDamagedM2(item.damaged_m2);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este material?')) return;
    await supabase.from('panel3_inventory').delete().eq('id', id);
    setInventory(inventory.filter(i => i.id !== id));
  };

  const handleRegisterDamage = async () => {
    if (!selectedDamageCode || !damageInput || Number(damageInput) <= 0) return;
    const target = inventory.find(i => i.code === selectedDamageCode || i.id === selectedDamageCode);
    if (!target) {
      alert('Material no encontrado con ese código');
      return;
    }

    const addedDamage = Number(damageInput);
    const newDamagedM2 = (target.damaged_m2 || 0) + addedDamage;
    
    await supabase.from('panel3_inventory').update({ damaged_m2: newDamagedM2 }).eq('id', target.id);
    setInventory(inventory.map(i => i.id === target.id ? { ...i, damaged_m2: newDamagedM2 } : i));
    setSelectedDamageCode('');
    setDamageInput('');
    alert(`Se registraron ${addedDamage} m² dañados al material ${target.name}.`);
  };

  const handleReplenishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replenishMatId || !replenishQty || Number(replenishQty) <= 0) {
      alert('Por favor selecciona un material y especifica una cantidad válida.');
      return;
    }

    const target = inventory.find(i => i.id === replenishMatId);
    if (!target) return;

    const addAmount = Number(replenishQty);
    const newStock = Number(target.stock) + addAmount;

    // 1. Update material stock in DB
    await supabase.from('panel3_inventory').update({ stock: newStock }).eq('id', target.id);
    setInventory(inventory.map(i => i.id === target.id ? { ...i, stock: newStock } : i));

    // 2. Create and insert log
    const newLog: Panel3InventoryLog = {
      id: crypto.randomUUID(),
      material_id: target.id,
      material_name: target.name,
      log_type: 'Entrada',
      quantity: addAmount,
      unit: target.unit,
      operator: replenishUser.trim() || 'Sistema',
      reference: 'Entrada manual / Compra',
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

    setReplenishQty('');
    alert(`Se agregaron ${addAmount} ${target.unit} de stock a ${target.name} con éxito.`);
  };

  const handleDirectExitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directMatId || !directQty || Number(directQty) <= 0) {
      alert('Por favor selecciona un material y especifica una cantidad de retiro válida.');
      return;
    }

    const target = inventory.find(i => i.id === directMatId);
    if (!target) return;

    const subtractAmount = Number(directQty);
    if (target.stock < subtractAmount) {
      if (!confirm(`El stock actual (${target.stock} ${target.unit}) es menor que la cantidad que deseas retirar (${subtractAmount} ${target.unit}). ¿Deseas retirar de todas formas y dejar el stock en negativo?`)) {
        return;
      }
    }

    const newStock = Math.max(0, Number(target.stock) - subtractAmount);

    // 1. Update stock in DB
    await supabase.from('panel3_inventory').update({ stock: newStock }).eq('id', target.id);
    setInventory(inventory.map(i => i.id === target.id ? { ...i, stock: newStock } : i));

    // 2. Create and insert log
    const newLog: Panel3InventoryLog = {
      id: crypto.randomUUID(),
      material_id: target.id,
      material_name: target.name,
      log_type: 'Salida Directa',
      quantity: subtractAmount,
      unit: target.unit,
      operator: directUser.trim() || 'Sistema',
      machine: directMachineArea.trim(),
      reference: 'Gasto operativo / Uso taller',
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

    setDirectQty('');
    alert(`Se retiraron ${subtractAmount} ${target.unit} de ${target.name} con éxito.`);
  };

  // Metrics
  const activeMaterialsCount = inventory.filter(i => i.stock > 0).length;
  const totalStockUnits = inventory.reduce((acc, i) => acc + (Number(i.stock) || 0), 0);
  const totalAreaAvailableM2 = inventory.reduce((acc, i) => {
    const sheetM2 = ((Number(i.width_cm) || 0) * (Number(i.length_cm) || 0)) / 10000;
    const grossM2 = sheetM2 * (Number(i.stock) || 0);
    return acc + Math.max(0, grossM2 - (Number(i.damaged_m2) || 0));
  }, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
            <Package className="w-8 h-8 text-amber-500" />
            Inventario de Taller
          </h2>
          <p className="text-zinc-500 font-medium mt-1">
            Control de insumos, pliegos, m² disponibles y mermas por daño.
          </p>
        </div>
        <button
          onClick={() => setShowPrintReport(true)}
          className="px-5 py-3 bg-zinc-900 hover:bg-black text-white font-bold rounded-2xl shadow-md transition-all text-sm flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          Imprimir Reporte
        </button>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Materiales Activos</p>
            <p className="text-3xl font-black text-zinc-900 mt-0.5">{activeMaterialsCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
            <Box className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pliegos / Unid. Disponibles</p>
            <p className="text-3xl font-black text-zinc-900 mt-0.5">{totalStockUnits}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckSquare className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Área Estimada Disponible</p>
            <p className="text-3xl font-black text-zinc-900 mt-0.5">{totalAreaAvailableM2.toFixed(2)} m²</p>
          </div>
        </div>
      </div>

      {/* Sub-tab Switcher */}
      <div className="flex border-b border-zinc-200 mt-6 mb-2">
        <button
          onClick={() => setSubTab('materiales')}
          className={`pb-4 px-6 font-extrabold text-sm transition-all relative ${
            subTab === 'materiales' ? 'text-amber-600 font-black' : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          {subTab === 'materiales' && <span className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-t-full" />}
          Insumos & Materiales de Stock
        </button>
        <button
          onClick={() => setSubTab('movimientos')}
          className={`pb-4 px-6 font-extrabold text-sm transition-all relative ${
            subTab === 'movimientos' ? 'text-amber-600 font-black' : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          {subTab === 'movimientos' && <span className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-t-full" />}
          Historial & Trazabilidad ({inventoryLogs.length})
        </button>
      </div>

      {subTab === 'materiales' ? (
        <div className="space-y-8 animate-fade-in">
          {/* Formulario Agregar Material */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200">
        <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-amber-500" />
          {editingId ? 'Editar Material' : 'Agregar Material / Insumo'}
        </h3>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Nombre del Material *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. Vinil Adhesivo Blanco Glos 120g"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Código de Arte (Opcional)
              </label>
              <input
                type="text"
                value={artCode}
                onChange={e => setArtCode(e.target.value)}
                placeholder="Ej. ART-VIN-01"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Categoría
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 focus:bg-white focus:border-amber-500 transition-all outline-none"
              >
                <option value="Material imprimible">Material imprimible</option>
                <option value="Viniles & Autoadhesivos">Viniles & Autoadhesivos</option>
                <option value="Acrílicos & Rígidos">Acrílicos & Rígidos</option>
                <option value="Papeles & Cartulinas">Papeles & Cartulinas</option>
                <option value="Insumos Taller">Insumos Taller</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Unidad de Stock
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 focus:bg-white focus:border-amber-500 transition-all outline-none"
              >
                <option value="pliego">Pliego</option>
                <option value="rollo">Rollo</option>
                <option value="m2">m²</option>
                <option value="unidad">Unidad</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Stock Inicial / Cantidad
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={e => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-amber-500 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Ancho (cm)
              </label>
              <input
                type="number"
                min="1"
                value={widthCm}
                onChange={e => setWidthCm(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="100"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-amber-500 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Largo (cm)
              </label>
              <input
                type="number"
                min="1"
                value={lengthCm}
                onChange={e => setLengthCm(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="100"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-amber-500 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Precio Venta / m² ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricePerM2}
                onChange={e => setPricePerM2(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-amber-500 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                m² Dañados Inciales
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={damagedM2}
                onChange={e => setDamagedM2(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-amber-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl shadow-md transition-all text-sm flex items-center gap-2"
            >
              {editingId ? 'Guardar Cambios' : 'Agregar Material'}
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
        </form>
      </div>

      {/* Registro rápido de m² dañados */}
      <div className="bg-amber-50/60 rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm">
        <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Registrar Daños / Mermas de Material
        </h3>
        <p className="text-xs text-amber-800/80 font-medium mb-4">
          Busca por código de material y registra la cantidad de m² dañados durante impresiones o manipulación.
        </p>

        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-amber-900 mb-1.5 uppercase">
              Buscar o Seleccionar Código
            </label>
            <select
              value={selectedDamageCode}
              onChange={e => setSelectedDamageCode(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-amber-300 rounded-xl text-sm font-bold text-zinc-800 outline-none"
            >
              <option value="">-- Selecciona Material --</option>
              {inventory.map(i => (
                <option key={i.id} value={i.code}>
                  [{i.code}] {i.name} (Stock: {i.stock} {i.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-48">
            <label className="block text-xs font-bold text-amber-900 mb-1.5 uppercase">
              m² Dañados a Añadir
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={damageInput}
              onChange={e => setDamageInput(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ej. 1.5"
              className="w-full px-4 py-3 bg-white border border-amber-300 rounded-xl text-sm font-bold text-zinc-800 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleRegisterDamage}
            className="w-full md:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all text-sm shrink-0 shadow-md"
          >
            Registrar Daños
          </button>
        </div>
      </div>

      {/* OPERACIONES DE INVENTARIO RÁPIDAS (REABASTECIMIENTO & SALIDA DIRECTA) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reabastecimiento Form */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-emerald-500" />
              Registrar Entrada (Reabastecimiento)
            </h3>
            <p className="text-xs text-zinc-500 mb-4">Suma stock de compras o ingresos al inventario general.</p>
            <form onSubmit={handleReplenishSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase">Seleccionar Insumo / Material</label>
                <select
                  value={replenishMatId}
                  onChange={e => setReplenishMatId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-emerald-500 outline-none"
                >
                  <option value="">-- Seleccionar --</option>
                  {inventory.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Disp: {i.stock} {i.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase">Cantidad a Agregar</label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={replenishQty}
                    onChange={e => setReplenishQty(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ej. 10"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase">Usuario / Operador</label>
                  <input
                    type="text"
                    value={replenishUser}
                    onChange={e => setReplenishUser(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={!replenishMatId || !replenishQty}
                className={`w-full py-2.5 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 transition-all mt-2 ${
                  replenishMatId && replenishQty
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                    : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                Registrar Entrada de Stock
              </button>
            </form>
          </div>
        </div>

        {/* Salida Directa Form */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2 flex items-center gap-2">
              <ArrowDownLeft className="w-5 h-5 text-red-500" />
              Registrar Salida Directa (Gastos Operativos)
            </h3>
            <p className="text-xs text-zinc-500 mb-4">Retira insumos generales y consumibles sin orden de producción vinculada.</p>
            <form onSubmit={handleDirectExitSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase">Seleccionar Insumo / Material</label>
                <select
                  value={directMatId}
                  onChange={e => setDirectMatId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-red-500 outline-none"
                >
                  <option value="">-- Seleccionar --</option>
                  {inventory.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} (Disp: {i.stock} {i.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase">Cantidad a Retirar</label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={directQty}
                    onChange={e => setDirectQty(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Ej. 2"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase">Usuario / Operador</label>
                  <input
                    type="text"
                    value={directUser}
                    onChange={e => setDirectUser(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-red-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase">Destino / Área de Consumo</label>
                <input
                  type="text"
                  value={directMachineArea}
                  onChange={e => setDirectMachineArea(e.target.value)}
                  placeholder="Ej. Administración, Limpieza, Empaque"
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-red-500 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={!directMatId || !directQty}
                className={`w-full py-2.5 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 transition-all mt-2 ${
                  directMatId && directQty
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-md'
                    : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                Registrar Salida Directa
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Tabla Inventario */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200">
        <h3 className="text-xl font-bold text-zinc-900 mb-6">
          Materiales e Insumos ({inventory.length})
        </h3>

        {inventory.length === 0 ? (
          <div className="p-12 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <Package className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500 font-bold text-lg">Agrega materiales e insumos para cotizar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Material</th>
                  <th className="py-3 px-4">Cód. Arte</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Formato (W x L)</th>
                  <th className="py-3 px-4">Área/Pliego</th>
                  <th className="py-3 px-4">m² Dañados</th>
                  <th className="py-3 px-4">Precio m²</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm font-medium text-zinc-700">
                {inventory.map(item => {
                  const areaPerSheet = ((item.width_cm * item.length_cm) / 10000).toFixed(2);
                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-4 px-4 font-mono text-xs font-bold text-amber-700 bg-amber-50/50 rounded-lg">
                        {item.code}
                      </td>
                      <td className="py-4 px-4 font-bold text-zinc-900">
                        {item.name}
                        <span className="block text-xs font-medium text-zinc-400">{item.category}</span>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-zinc-500">{item.art_code || '-'}</td>
                      <td className="py-4 px-4 font-bold text-zinc-900">
                        {item.stock} <span className="text-xs font-normal text-zinc-500">{item.unit}</span>
                      </td>
                      <td className="py-4 px-4 font-medium text-zinc-600">{item.width_cm} x {item.length_cm} cm</td>
                      <td className="py-4 px-4 text-zinc-600 font-semibold">{areaPerSheet} m²</td>
                      <td className="py-4 px-4 text-red-600 font-bold">{item.damaged_m2} m²</td>
                      <td className="py-4 px-4 font-black text-emerald-600">${item.price_per_m2.toFixed(2)}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-zinc-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
      ) : (
        /* TABLA DE TRAZABILIDAD / HISTORIAL DE MOVIMIENTOS */
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-zinc-900">Historial de Movimientos e Imputaciones</h3>
              <p className="text-xs text-zinc-500 mt-1">Trazabilidad en tiempo real de entradas, salidas directas y consumos de producción.</p>
            </div>
            
            <button
              onClick={() => {
                const bodyHtml = `
                  <div style="font-family: sans-serif; padding: 20px;">
                    <h2 style="margin: 0 0 5px 0;">Historial de Trazabilidad de Inventario</h2>
                    <p style="color: #666; font-size: 12px; margin-top: 0; margin-bottom: 20px;">Generado el ${new Date().toLocaleDateString()}</p>
                    <table style="width:100%; border-collapse:collapse; font-size:12px; text-align:left;">
                      <thead>
                        <tr style="background:#f4f4f5; border-bottom:1px solid #e4e4e7;">
                          <th style="padding:10px;">Fecha</th>
                          <th style="padding:10px;">Tipo</th>
                          <th style="padding:10px;">Insumo</th>
                          <th style="padding:10px;">Cantidad</th>
                          <th style="padding:10px;">Operador / Máquina</th>
                          <th style="padding:10px;">Detalle / Referencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${inventoryLogs.map(l => `
                          <tr style="border-bottom:1px solid #f4f4f5;">
                            <td style="padding:10px;">${new Date(l.created_at || '').toLocaleString()}</td>
                            <td style="padding:10px;"><strong>${l.log_type}</strong></td>
                            <td style="padding:10px;">${l.material_name}</td>
                            <td style="padding:10px;">${l.quantity} ${l.unit}</td>
                            <td style="padding:10px;">${l.operator} ${l.machine ? `(${l.machine})` : ''}</td>
                            <td style="padding:10px;">${l.reference || '-'}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                `;
                downloadAndPrintReport('Historial Trazabilidad de Inventario', bodyHtml, 'trazabilidad_inventario_taller.html');
              }}
              className="px-4 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md self-start print:hidden"
            >
              <Download className="w-4 h-4" />
              Exportar Trazabilidad (HTML)
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por insumo, operador o referencia..."
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:bg-white focus:border-amber-500"
              />
            </div>
            
            <div className="w-full sm:w-48">
              <select
                value={historyFilter}
                onChange={e => setHistoryFilter(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none focus:bg-white focus:border-amber-500"
              >
                <option value="all">Todos los Tipos</option>
                <option value="Entrada">Entradas</option>
                <option value="Salida Directa">Salidas Directas</option>
                <option value="Salida Orden">Salidas por Orden</option>
              </select>
            </div>
          </div>

          {/* History Logs Table */}
          {(() => {
            const filteredLogs = inventoryLogs.filter(log => {
              const matchesSearch = 
                log.material_name.toLowerCase().includes(historySearch.toLowerCase()) ||
                log.operator.toLowerCase().includes(historySearch.toLowerCase()) ||
                (log.reference || '').toLowerCase().includes(historySearch.toLowerCase()) ||
                (log.machine || '').toLowerCase().includes(historySearch.toLowerCase());
                
              const matchesFilter = historyFilter === 'all' || log.log_type === historyFilter;
              
              return matchesSearch && matchesFilter;
            });

            if (filteredLogs.length === 0) {
              return (
                <div className="p-12 text-center bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                  <Layers className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                  <p className="text-zinc-500 font-bold text-lg">No se encontraron movimientos registrados.</p>
                  <p className="text-xs text-zinc-400 mt-1">Realiza entradas, salidas o finaliza órdenes para alimentar la trazabilidad.</p>
                </div>
              );
            }

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Fecha & Hora</th>
                      <th className="py-3 px-4">Tipo de Movimiento</th>
                      <th className="py-3 px-4">Insumo / Material</th>
                      <th className="py-3 px-4">Cantidad</th>
                      <th className="py-3 px-4">Operador Responsable</th>
                      <th className="py-3 px-4">Máquina / Destino</th>
                      <th className="py-3 px-4">Detalle / Referencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-sm font-medium text-zinc-700">
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-zinc-500 text-xs whitespace-nowrap">
                          {new Date(log.created_at || '').toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-bold">
                          <span className={`px-2.5 py-1 rounded-full text-xs flex items-center gap-1 w-max ${
                            log.log_type === 'Entrada'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : log.log_type === 'Salida Directa'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {log.log_type === 'Entrada' ? (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            ) : log.log_type === 'Salida Directa' ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : (
                              <Package className="w-3.5 h-3.5" />
                            )}
                            {log.log_type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-zinc-900">{log.material_name}</td>
                        <td className={`py-3.5 px-4 font-extrabold ${log.log_type === 'Entrada' ? 'text-emerald-600' : 'text-zinc-800'}`}>
                          {log.log_type === 'Entrada' ? '+' : '-'}{log.quantity} <span className="text-xs font-normal text-zinc-500">{log.unit}</span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-zinc-700">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-zinc-400" />
                            {log.operator}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-600 font-semibold">
                          {log.machine ? (
                            <span className="flex items-center gap-1.5">
                              <Hammer className="w-3.5 h-3.5 text-zinc-400" />
                              {log.machine}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-500 text-xs font-mono font-bold">
                          {log.reference || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* Modal Reporte Imprimible */}
      {showPrintReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-2xl font-black text-zinc-900">Reporte de Inventario de Taller</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Generado el {new Date().toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => setShowPrintReport(false)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs print:hidden"
              >
                Cerrar
              </button>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b font-bold text-zinc-500">
                  <th className="py-2">Código</th>
                  <th className="py-2">Material</th>
                  <th className="py-2">Stock</th>
                  <th className="py-2">Formato</th>
                  <th className="py-2">Precio m²</th>
                  <th className="py-2">Dañados</th>
                </tr>
              </thead>
              <tbody className="divide-y text-zinc-800">
                {inventory.map(i => (
                  <tr key={i.id}>
                    <td className="py-2 font-mono font-bold">{i.code}</td>
                    <td className="py-2 font-bold">{i.name}</td>
                    <td className="py-2">{i.stock} {i.unit}</td>
                    <td className="py-2">{i.width_cm}x{i.length_cm} cm</td>
                    <td className="py-2">${i.price_per_m2}</td>
                    <td className="py-2 text-red-600">{i.damaged_m2} m²</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-4 border-t flex justify-end gap-3 print:hidden">
              <button
                onClick={() => {
                  const bodyHtml = `
                    <div class="summary-grid">
                      <div class="summary-item">
                        <span class="summary-label">Materiales Activos</span>
                        <span class="summary-value">${activeMaterialsCount}</span>
                      </div>
                      <div class="summary-item">
                        <span class="summary-label">Stock Unidades</span>
                        <span class="summary-value">${totalStockUnits} unids.</span>
                      </div>
                      <div class="summary-item">
                        <span class="summary-label">m² Disponibles</span>
                        <span class="summary-value" style="color: #d97706;">${totalAreaAvailableM2.toFixed(2)} m²</span>
                      </div>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Material</th>
                          <th>Stock</th>
                          <th>Formato</th>
                          <th>Precio m²</th>
                          <th>Dañados</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${inventory.map(i => `
                          <tr>
                            <td><strong>${i.code}</strong></td>
                            <td><strong>${i.name}</strong></td>
                            <td>${i.stock} ${i.unit}</td>
                            <td>${i.width_cm}x${i.length_cm} cm</td>
                            <td>$${i.price_per_m2}</td>
                            <td style="color: #dc2626;">${i.damaged_m2} m²</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  `;
                  downloadAndPrintReport('Reporte de Inventario de Taller', bodyHtml, 'inventario_taller.html');
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
