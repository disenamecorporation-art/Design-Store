import React, { useState, useMemo } from 'react';
import { Panel3Quote, Panel3Client, Panel3InventoryItem } from './types';
import { FileText, Plus, RefreshCw, Printer, Trash2, Edit3, Check, CheckCircle2, Layout, DollarSign, Calendar, Sparkles, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { downloadAndPrintReport } from '../../lib/printUtils';

interface QuotesTabProps {
  quotes: Panel3Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Panel3Quote[]>>;
  clients: Panel3Client[];
  inventory: Panel3InventoryItem[];
}

export const QuotesTab: React.FC<QuotesTabProps> = ({ quotes, setQuotes, clients, inventory }) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [clientId, setClientId] = useState('');
  const [clientNameInput, setClientNameInput] = useState('');
  const [productType, setProductType] = useState('Etiqueta');
  const [jobName, setJobName] = useState('');
  const [materialId, setMaterialId] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(500);
  const [pieceWidthCm, setPieceWidthCm] = useState<number | ''>(10);
  const [pieceLengthCm, setPieceLengthCm] = useState<number | ''>(15);
  const [separationCm, setSeparationCm] = useState<number | ''>(0.5);
  const [marginCm, setMarginCm] = useState<number | ''>(1.5);
  const [profitMarginPct, setProfitMarginPct] = useState<number | ''>(35);
  const [currency, setCurrency] = useState<'USD $' | 'Bs'>('USD $');
  const [exchangeRate, setExchangeRate] = useState<number | ''>(60.50);
  const [includeIva, setIncludeIva] = useState(false);
  const [ivaPct, setIvaPct] = useState<number | ''>(16);
  const [notes, setNotes] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [priority, setPriority] = useState<'Baja' | 'Normal' | 'Alta' | 'Urgente'>('Normal');
  const [quoteType, setQuoteType] = useState<'Cotización regular' | 'Muestra sin cobro' | 'Prototipo' | 'Promocional'>('Cotización regular');

  // Print Modal
  const [selectedPrintQuote, setSelectedPrintQuote] = useState<Panel3Quote | null>(null);
  const [showPrintReport, setShowPrintReport] = useState(false);

  // Selected Material details
  const selectedMaterial = inventory.find(i => i.id === materialId || i.name === materialId);
  const matWidth = selectedMaterial ? selectedMaterial.width_cm : 100;
  const matLength = selectedMaterial ? selectedMaterial.length_cm : 100;
  const matPriceM2 = selectedMaterial ? selectedMaterial.price_per_m2 : 15;
  const sheetFormatStr = selectedMaterial ? `${matWidth} cm x ${matLength} cm` : '100 cm x 100 cm';

  // Code generation
  const getNextQuoteCode = () => {
    const num = quotes.length + 1;
    let prefix = 'COT';
    if (productType === 'Etiqueta') prefix = 'ETQ';
    if (productType === 'Gigantografía') prefix = 'GIG';
    if (productType === 'Pendón') prefix = 'PEN';
    if (productType === 'Volantes') prefix = 'VOL';
    if (productType === 'Empaques') prefix = 'EMP';
    return `${prefix}${String(num).padStart(4, '0')}`;
  };

  // Calculation Logic
  const calcResults = useMemo(() => {
    const qty = Number(quantity) || 0;
    const w = Number(pieceWidthCm) || 0;
    const h = Number(pieceLengthCm) || 0;
    const sep = Number(separationCm) || 0;
    const mar = Number(marginCm) || 0;
    const marginPct = Number(profitMarginPct) || 0;
    const rate = Number(exchangeRate) || 1;
    const iva = includeIva ? (Number(ivaPct) || 0) : 0;

    if (qty <= 0 || w <= 0 || h <= 0) {
      return { piecesPerSheet: 0, sheetsNeeded: 0, netM2: 0, subtotalUsd: 0, totalUsd: 0, totalBs: 0, cols: 0, rows: 0 };
    }

    const effSheetW = Math.max(1, matWidth - 2 * mar);
    const effSheetH = Math.max(1, matLength - 2 * mar);

    const pieceWWithSep = w + sep;
    const pieceHWithSep = h + sep;

    // Layout Normal
    const colsNormal = Math.floor(effSheetW / pieceWWithSep);
    const rowsNormal = Math.floor(effSheetH / pieceHWithSep);
    const piecesNormal = Math.max(0, colsNormal * rowsNormal);

    // Layout Rotated
    const colsRotated = Math.floor(effSheetW / pieceHWithSep);
    const rowsRotated = Math.floor(effSheetH / pieceWWithSep);
    const piecesRotated = Math.max(0, colsRotated * rowsRotated);

    const isRotatedBest = piecesRotated > piecesNormal;
    const piecesPerSheet = Math.max(1, Math.max(piecesNormal, piecesRotated));
    const cols = isRotatedBest ? colsRotated : colsNormal;
    const rows = isRotatedBest ? rowsRotated : rowsNormal;

    const sheetsNeeded = Math.ceil(qty / piecesPerSheet);
    const netM2 = (qty * w * h) / 10000;
    const sheetM2 = (matWidth * matLength) / 10000;
    const totalMaterialM2 = sheetsNeeded * sheetM2;

    const baseMaterialCost = netM2 * matPriceM2;
    const subtotalWithProfit = baseMaterialCost * (1 + marginPct / 100);
    let finalTotalUsd = subtotalWithProfit * (1 + iva / 100);

    // If "Muestra sin cobro"
    if (quoteType === 'Muestra sin cobro') {
      finalTotalUsd = 0;
    }

    const finalTotalBs = finalTotalUsd * rate;

    return {
      piecesPerSheet,
      sheetsNeeded,
      netM2,
      subtotalUsd: subtotalWithProfit,
      totalUsd: finalTotalUsd,
      totalBs: finalTotalBs,
      cols,
      rows,
      itemW: isRotatedBest ? h : w,
      itemH: isRotatedBest ? w : h
    };
  }, [quantity, pieceWidthCm, pieceLengthCm, separationCm, marginCm, profitMarginPct, exchangeRate, includeIva, ivaPct, matWidth, matLength, matPriceM2, quoteType]);

  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobName.trim()) return;

    const selectedClient = clients.find(c => c.id === clientId);
    const finalClientName = selectedClient ? selectedClient.name : (clientNameInput.trim() || 'Cliente General');

    const quoteData = {
      code: editingId ? (quotes.find(q => q.id === editingId)?.code || getNextQuoteCode()) : getNextQuoteCode(),
      client_id: clientId,
      client_name: finalClientName,
      product_type: productType,
      job_name: jobName.trim(),
      material_id: materialId,
      material_name: selectedMaterial ? selectedMaterial.name : 'Material Taller',
      sheet_format: sheetFormatStr,
      quantity: Number(quantity) || 1,
      piece_width_cm: Number(pieceWidthCm) || 0,
      piece_length_cm: Number(pieceLengthCm) || 0,
      separation_cm: Number(separationCm) || 0,
      margin_cm: Number(marginCm) || 0,
      profit_margin_pct: Number(profitMarginPct) || 0,
      currency,
      exchange_rate: Number(exchangeRate) || 1,
      include_iva: includeIva,
      iva_pct: Number(ivaPct) || 0,
      notes: notes.trim(),
      delivery_date: deliveryDate,
      priority,
      quote_type: quoteType,
      total_usd: calcResults.totalUsd,
      total_bs: calcResults.totalBs,
      status: 'Pendiente' as const,
    };

    if (editingId) {
      await supabase.from('panel3_quotes').update(quoteData).eq('id', editingId);
      setQuotes(quotes.map(q => q.id === editingId ? { ...q, ...quoteData } : q));
      setEditingId(null);
    } else {
      const newObj: Panel3Quote = {
        id: crypto.randomUUID(),
        ...quoteData,
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('panel3_quotes').insert([newObj]).select().single();
      if (!error && data) {
        setQuotes([data, ...quotes]);
      } else {
        setQuotes([newObj, ...quotes]);
      }
    }

    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setClientId('');
    setClientNameInput('');
    setJobName('');
    setQuantity(500);
    setPieceWidthCm(10);
    setPieceLengthCm(15);
    setSeparationCm(0.5);
    setMarginCm(1.5);
    setNotes('');
  };

  const handleEdit = (q: Panel3Quote) => {
    setEditingId(q.id);
    setClientId(q.client_id || '');
    setClientNameInput(q.client_name);
    setProductType(q.product_type);
    setJobName(q.job_name);
    setMaterialId(q.material_id || '');
    setQuantity(q.quantity);
    setPieceWidthCm(q.piece_width_cm);
    setPieceLengthCm(q.piece_length_cm);
    setSeparationCm(q.separation_cm);
    setMarginCm(q.margin_cm);
    setProfitMarginPct(q.profit_margin_pct);
    setCurrency(q.currency);
    setExchangeRate(q.exchange_rate);
    setIncludeIva(q.include_iva);
    setIvaPct(q.iva_pct);
    setNotes(q.notes || '');
    setDeliveryDate(q.delivery_date || '');
    setPriority(q.priority);
    setQuoteType(q.quote_type);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta cotización?')) return;
    await supabase.from('panel3_quotes').delete().eq('id', id);
    setQuotes(quotes.filter(q => q.id !== id));
  };

  const handleApprove = async (id: string) => {
    await supabase.from('panel3_quotes').update({ status: 'Aprobada' }).eq('id', id);
    setQuotes(quotes.map(q => q.id === id ? { ...q, status: 'Aprobada' } : q));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-amber-500" />
            Área de Cotización
          </h2>
          <p className="text-zinc-500 font-medium mt-1">
            Calculadora avanzada de imposición de pliego, precios por m² e impuestos.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => setShowPrintReport(true)}
            className="px-5 py-3 bg-zinc-900 hover:bg-black text-white font-bold rounded-2xl shadow-md transition-all text-sm flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            Imprimir Reporte General
          </button>
          {quotes.length > 0 && (
            <button
              onClick={() => setSelectedPrintQuote(quotes[0])}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-2xl shadow-md transition-all text-sm flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir Última Cotización
            </button>
          )}
        </div>
      </div>

      {/* Grid: Formulario + Previsualizador Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Formulario (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200 space-y-6">
          <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Datos de fabricación y venta
          </h3>

          <form onSubmit={handleSaveQuote} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Cliente Select */}
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                  Cliente *
                </label>
                <select
                  value={clientId}
                  onChange={e => {
                    setClientId(e.target.value);
                    const selected = clients.find(c => c.id === e.target.value);
                    if (selected) setClientNameInput(selected.name);
                  }}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
                >
                  <option value="">-- Selecciona Cliente --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {!clientId && (
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                    Nombre Cliente Directo
                  </label>
                  <input
                    type="text"
                    value={clientNameInput}
                    onChange={e => setClientNameInput(e.target.value)}
                    placeholder="Ej. Comercializadora Alfa"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none"
                  />
                </div>
              )}

              {/* Tipo Producto */}
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                  Tipo de Producto
                </label>
                <select
                  value={productType}
                  onChange={e => setProductType(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
                >
                  <option value="Etiqueta">Etiquetas & Stickers</option>
                  <option value="Gigantografía">Gigantografía</option>
                  <option value="Pendón">Pendón</option>
                  <option value="Volantes">Volantes</option>
                  <option value="Empaques">Empaques Flexibles</option>
                  <option value="Microperforado">Microperforado</option>
                  <option value="Vinil Adhesivo">Vinil Adhesivo</option>
                  <option value="Grabado Láser">Grabado Láser</option>
                  <option value="Impresión 3D">Impresión 3D</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {/* Nombre Trabajo */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                  Nombre del Trabajo *
                </label>
                <input
                  type="text"
                  required
                  value={jobName}
                  onChange={e => setJobName(e.target.value)}
                  placeholder="Ej. Etiquetas Troqueladas Marca Salsa Criolla 10x15cm"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>

              {/* Material Select */}
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                  Material / Rollo
                </label>
                <select
                  value={materialId}
                  onChange={e => setMaterialId(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
                >
                  <option value="">-- Selecciona Material --</option>
                  {inventory.map(i => (
                    <option key={i.id} value={i.id}>
                      [{i.code}] {i.name} (${i.price_per_m2}/m²)
                    </option>
                  ))}
                </select>
              </div>

              {/* Pliego Auto */}
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                  Pliego de Corte (cm)
                </label>
                <input
                  type="text"
                  readOnly
                  value={sheetFormatStr}
                  className="w-full px-4 py-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm font-bold outline-none"
                />
              </div>

              {/* Cantidad Solicitada */}
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                  Cantidad Solicitada *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
                />
              </div>

              {/* Medidas Pieza */}
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                  Ancho Final (cm) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={pieceWidthCm}
                  onChange={e => setPieceWidthCm(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                  Alto Final (cm) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={pieceLengthCm}
                  onChange={e => setPieceLengthCm(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                  Separación Piezas (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={separationCm}
                  onChange={e => setSeparationCm(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                  Margen Pliego (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={marginCm}
                  onChange={e => setMarginCm(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                  Margen de Venta (%)
                </label>
                <input
                  type="number"
                  min="0"
                  value={profitMarginPct}
                  onChange={e => setProfitMarginPct(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                  Moneda
                </label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value as any)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
                >
                  <option value="USD $">USD $</option>
                  <option value="Bs">Bs (Bolívares)</option>
                </select>
              </div>

              {currency === 'Bs' && (
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                    Tasa de Cambio (Bs/$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={exchangeRate}
                    onChange={e => setExchangeRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                  Incluir IVA
                </label>
                <select
                  value={includeIva ? 'Sí' : 'No'}
                  onChange={e => setIncludeIva(e.target.value === 'Sí')}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
                >
                  <option value="No">No</option>
                  <option value="Sí">Sí</option>
                </select>
              </div>

              {includeIva && (
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                    % IVA
                  </label>
                  <input
                    type="number"
                    value={ivaPct}
                    onChange={e => setIvaPct(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                  Prioridad
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
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
                  Tipo de Cotización
                </label>
                <select
                  value={quoteType}
                  onChange={e => setQuoteType(e.target.value as any)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
                >
                  <option value="Cotización regular">Cotización regular</option>
                  <option value="Muestra sin cobro">Muestra sin cobro</option>
                  <option value="Prototipo">Prototipo</option>
                  <option value="Promocional">Promocional</option>
                </select>
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

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                  Notas / Especificaciones Técnicas
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Instrucciones de acabado, color, empaque o montaje..."
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 outline-none resize-none"
                />
              </div>
            </div>

            {/* Resultado resumen */}
            <div className="p-4 bg-zinc-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Total Calculado</span>
                <p className="text-3xl font-black">
                  ${calcResults.totalUsd.toFixed(2)} USD
                  {currency === 'Bs' && (
                    <span className="text-lg font-bold text-zinc-400 ml-2">
                      (Bs. {calcResults.totalBs.toFixed(2)})
                    </span>
                  )}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Piezas/Pliego: {calcResults.piecesPerSheet} | Pliegos Necesarios: {calcResults.sheetsNeeded} | m² Netos: {calcResults.netM2.toFixed(2)} m²
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => alert('Cálculo actualizado')}
                  className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Actualizar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-sm shadow-md transition-all"
                >
                  {editingId ? 'Guardar Cambios' : 'Guardar Cotización'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Panel Previsualizador Montaje (1 Col) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200 space-y-6">
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Layout className="w-5 h-5 text-amber-500" />
            Previsualizador de Montaje
          </h3>

          {!pieceWidthCm || !pieceLengthCm ? (
            <div className="h-64 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 flex flex-col items-center justify-center text-center p-6">
              <Layout className="w-10 h-10 text-zinc-300 mb-2" />
              <p className="text-zinc-400 font-bold text-sm">Ingresa medidas para previsualizar el montaje.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative w-full aspect-square bg-zinc-900 rounded-2xl p-4 flex items-center justify-center overflow-hidden border border-zinc-800">
                {/* Visual Canvas SVG representing Sheet Layout */}
                <svg className="w-full h-full border border-amber-500/30 rounded-lg bg-zinc-950 p-2" viewBox="0 0 100 100">
                  {/* Grid of pieces */}
                  {Array.from({ length: Math.min(64, calcResults.piecesPerSheet) }).map((_, idx) => {
                    const row = Math.floor(idx / Math.max(1, calcResults.cols));
                    const col = idx % Math.max(1, calcResults.cols);
                    const cellW = 90 / Math.max(1, calcResults.cols);
                    const cellH = 90 / Math.max(1, calcResults.rows);
                    return (
                      <rect
                        key={idx}
                        x={5 + col * cellW}
                        y={5 + row * cellH}
                        width={cellW * 0.9}
                        height={cellH * 0.9}
                        rx="1"
                        fill="#f59e0b"
                        fillOpacity="0.4"
                        stroke="#f59e0b"
                        strokeWidth="0.5"
                      />
                    );
                  })}
                </svg>
              </div>

              <div className="space-y-2 text-xs font-medium text-zinc-600 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                <div className="flex justify-between"><span>Pliego:</span> <strong className="text-zinc-900">{matWidth} x {matLength} cm</strong></div>
                <div className="flex justify-between"><span>Pieza:</span> <strong className="text-zinc-900">{pieceWidthCm} x {pieceLengthCm} cm</strong></div>
                <div className="flex justify-between"><span>Distribución:</span> <strong className="text-zinc-900">{calcResults.cols} col x {calcResults.rows} filas</strong></div>
                <div className="flex justify-between"><span>Total / Pliego:</span> <strong className="text-amber-600 font-bold">{calcResults.piecesPerSheet} unid.</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabla Cotizaciones Registradas */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200">
        <h3 className="text-xl font-bold text-zinc-900 mb-6">
          Cotizaciones Registradas ({quotes.length})
        </h3>

        {quotes.length === 0 ? (
          <div className="p-12 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500 font-bold text-lg">Crea tu primera cotización.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Trabajo</th>
                  <th className="py-3 px-4">Cantidad</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Prioridad</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm font-medium text-zinc-700">
                {quotes.map(q => (
                  <tr key={q.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-4 px-4 font-mono text-xs font-bold text-amber-800 bg-amber-50/60 rounded-lg">
                      {q.code}
                    </td>
                    <td className="py-4 px-4 font-bold text-zinc-900">{q.client_name}</td>
                    <td className="py-4 px-4 text-zinc-600">
                      {q.job_name}
                      <span className="block text-xs text-zinc-400">{q.product_type}</span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-zinc-800">{q.quantity} unid.</td>
                    <td className="py-4 px-4 font-black text-emerald-600">${q.total_usd.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-800">
                        {q.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        q.status === 'Aprobada' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {q.status !== 'Aprobada' && (
                          <button
                            onClick={() => handleApprove(q.id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Aprobar Cotización"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedPrintQuote(q)}
                          className="p-2 text-zinc-500 hover:text-zinc-900 rounded-lg transition-colors"
                          title="Imprimir"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(q)}
                          className="p-2 text-zinc-500 hover:text-amber-600 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
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

      {/* Modal Imprimir Cotización */}
      {selectedPrintQuote && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-2xl font-black text-zinc-900">PRESUPUESTO / COTIZACIÓN</h3>
                <p className="text-xs font-mono font-bold text-amber-600 mt-0.5">{selectedPrintQuote.code}</p>
              </div>
              <button
                onClick={() => setSelectedPrintQuote(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs print:hidden"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-medium text-zinc-700 bg-zinc-50 p-4 rounded-2xl">
              <div><strong>Cliente:</strong> {selectedPrintQuote.client_name}</div>
              <div><strong>Fecha:</strong> {new Date().toLocaleDateString()}</div>
              <div><strong>Trabajo:</strong> {selectedPrintQuote.job_name}</div>
              <div><strong>Tipo:</strong> {selectedPrintQuote.product_type}</div>
              <div><strong>Cantidad:</strong> {selectedPrintQuote.quantity} unidades</div>
              <div><strong>Dimensiones:</strong> {selectedPrintQuote.piece_width_cm} x {selectedPrintQuote.piece_length_cm} cm</div>
            </div>

            <div className="p-6 bg-zinc-900 text-white rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-400 font-bold uppercase">Total Cotizado</p>
                <p className="text-3xl font-black">${selectedPrintQuote.total_usd.toFixed(2)} USD</p>
                {selectedPrintQuote.currency === 'Bs' && (
                  <p className="text-xs text-zinc-400">Bs. {selectedPrintQuote.total_bs.toFixed(2)}</p>
                )}
              </div>
            </div>

            {selectedPrintQuote.notes && (
              <p className="text-xs text-zinc-500"><strong>Notas:</strong> {selectedPrintQuote.notes}</p>
            )}

            <div className="pt-4 border-t flex justify-end gap-3 print:hidden">
              <button
                onClick={() => {
                  const bodyHtml = `
                    <div style="background: #f4f4f5; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                      <h2 style="margin: 0 0 10px 0; font-size: 16px;">${selectedPrintQuote.code} — ${selectedPrintQuote.job_name}</h2>
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
                        <div><strong>Cliente:</strong> ${selectedPrintQuote.client_name}</div>
                        <div><strong>Tipo de Producto:</strong> ${selectedPrintQuote.product_type}</div>
                        <div><strong>Cantidad:</strong> ${selectedPrintQuote.quantity} unidades</div>
                        <div><strong>Medidas:</strong> ${selectedPrintQuote.piece_width_cm} x ${selectedPrintQuote.piece_length_cm} cm</div>
                        <div><strong>Material:</strong> ${selectedPrintQuote.material_name}</div>
                        <div><strong>Estado:</strong> ${selectedPrintQuote.status}</div>
                      </div>
                    </div>
                    <div style="background: #18181b; color: #fff; padding: 20px; border-radius: 12px; text-align: center;">
                      <span style="font-size: 12px; color: #fbbf24; text-transform: uppercase; font-weight: bold;">TOTAL COTIZADO</span>
                      <h2 style="font-size: 32px; margin: 4px 0 0 0; color: #ffffff;">$${selectedPrintQuote.total_usd.toFixed(2)} USD</h2>
                      ${selectedPrintQuote.currency === 'Bs' ? `<p style="font-size: 13px; color: #a1a1aa; margin-top: 4px;">(Bs. ${selectedPrintQuote.total_bs.toFixed(2)})</p>` : ''}
                    </div>
                    ${selectedPrintQuote.notes ? `<p style="margin-top: 20px; font-size: 12px; color: #52525b;"><strong>Notas:</strong> ${selectedPrintQuote.notes}</p>` : ''}
                  `;
                  downloadAndPrintReport(`Cotización Taller ${selectedPrintQuote.code}`, bodyHtml, `cotizacion_${selectedPrintQuote.code}.html`);
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

      {/* Modal Reporte General de Cotizaciones Imprimible */}
      {showPrintReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-8 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-2xl font-black text-zinc-900">Reporte General de Cotizaciones</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Generado el {new Date().toLocaleDateString()} — Total: {quotes.length} cotizaciones</p>
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
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Cliente</th>
                    <th className="py-2.5 px-3">Trabajo / Producto</th>
                    <th className="py-2.5 px-3">Cantidad</th>
                    <th className="py-2.5 px-3">Monto USD</th>
                    <th className="py-2.5 px-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-zinc-800">
                  {quotes.map(q => (
                    <tr key={q.id}>
                      <td className="py-2.5 px-3 font-mono font-bold">{q.code}</td>
                      <td className="py-2.5 px-3 font-bold">{q.client_name}</td>
                      <td className="py-2.5 px-3">{q.job_name} ({q.product_type})</td>
                      <td className="py-2.5 px-3">{q.quantity} unids.</td>
                      <td className="py-2.5 px-3 font-mono font-bold">${q.total_usd.toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-bold">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                          q.status === 'Aprobada' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {q.status}
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
                          <th>Código</th>
                          <th>Cliente</th>
                          <th>Trabajo / Producto</th>
                          <th>Cantidad</th>
                          <th>Monto USD</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${quotes.map(q => `
                          <tr>
                            <td><strong>${q.code}</strong></td>
                            <td>${q.client_name}</td>
                            <td>${q.job_name} (${q.product_type})</td>
                            <td>${q.quantity} unids.</td>
                            <td style="font-family: monospace; font-weight: bold;">$${q.total_usd.toFixed(2)}</td>
                            <td>${q.status}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  `;
                  downloadAndPrintReport('Reporte General de Cotizaciones', bodyHtml, 'reporte_cotizaciones_taller.html');
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
