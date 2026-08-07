import React, { useState } from 'react';
import { Panel3Quote, Panel3FinancialMovement } from './types';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Wallet, Scale, Printer, Plus, Trash2, CheckCircle, FileText, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { downloadAndPrintReport } from '../../lib/printUtils';

interface SalesTabProps {
  quotes: Panel3Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Panel3Quote[]>>;
  movements: Panel3FinancialMovement[];
  setMovements: React.Dispatch<React.SetStateAction<Panel3FinancialMovement[]>>;
}

export const SalesTab: React.FC<SalesTabProps> = ({ quotes, setQuotes, movements, setMovements }) => {
  // Collection Inputs for quotes: map quote.id -> amount
  const [collectionAmounts, setCollectionAmounts] = useState<Record<string, number>>({});

  // Form Direct Movement
  const [concept, setConcept] = useState('');
  const [movementType, setMovementType] = useState('Compra directa');
  const [amountUsd, setAmountUsd] = useState<number | ''>(50);
  const [exchangeRate, setExchangeRate] = useState<number | ''>(60.50);
  const [pagoBs, setPagoBs] = useState<number | ''>('');

  // Print Report Modal
  const [showPrintReport, setShowPrintReport] = useState(false);

  // Approved quotes
  const approvedQuotes = quotes.filter(q => q.status === 'Aprobada');

  // Calculate total collected per quote from movements where quote_code is set
  const getCollectedForQuote = (code: string) => {
    return movements
      .filter(m => m.quote_code === code && m.movement_type === 'Cobro cotización')
      .reduce((acc, m) => acc + (Number(m.amount_usd) || 0), 0);
  };

  const handleRegisterPayment = async (quote: Panel3Quote) => {
    const inputVal = collectionAmounts[quote.id];
    if (!inputVal || inputVal <= 0) return;

    const rate = quote.exchange_rate || 60.50;
    const amountBsVal = inputVal * rate;

    const newMov: Panel3FinancialMovement = {
      id: crypto.randomUUID(),
      concept: `Cobro Cotización ${quote.code} - ${quote.job_name}`,
      movement_type: 'Cobro cotización',
      quote_code: quote.code,
      amount_usd: inputVal,
      amount_bs: amountBsVal,
      exchange_rate: rate,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('panel3_financial_movements').insert([newMov]).select().single();
    if (!error && data) {
      setMovements([data, ...movements]);
    } else {
      setMovements([newMov, ...movements]);
    }

    setCollectionAmounts({ ...collectionAmounts, [quote.id]: 0 });
    alert(`Cobro de $${inputVal} registrado para la cotización ${quote.code}.`);
  };

  const handleRegisterDirectExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || !amountUsd || Number(amountUsd) <= 0) return;

    const rate = Number(exchangeRate) || 1;
    const usdVal = Number(amountUsd);
    const bsVal = pagoBs ? Number(pagoBs) : usdVal * rate;

    const newMov: Panel3FinancialMovement = {
      id: crypto.randomUUID(),
      concept: concept.trim(),
      movement_type: movementType,
      amount_usd: usdVal,
      amount_bs: bsVal,
      exchange_rate: rate,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('panel3_financial_movements').insert([newMov]).select().single();
    if (!error && data) {
      setMovements([data, ...movements]);
    } else {
      setMovements([newMov, ...movements]);
    }

    setConcept('');
    setAmountUsd(50);
    setPagoBs('');
  };

  const handleDeleteMovement = async (id: string) => {
    if (!confirm('¿Eliminar este registro de movimiento?')) return;
    await supabase.from('panel3_financial_movements').delete().eq('id', id);
    setMovements(movements.filter(m => m.id !== id));
  };

  // Metrics
  const totalCollectedUsd = movements
    .filter(m => m.movement_type === 'Cobro cotización' || m.amount_usd > 0 && !m.movement_type.includes('Compra') && !m.movement_type.includes('Salida') && !m.movement_type.includes('Mantenimiento') && !m.movement_type.includes('Insumos'))
    .reduce((acc, m) => acc + (Number(m.amount_usd) || 0), 0);

  const totalExpensesUsd = movements
    .filter(m => m.movement_type.includes('Compra') || m.movement_type.includes('Salida') || m.movement_type.includes('Mantenimiento') || m.movement_type.includes('Insumos'))
    .reduce((acc, m) => acc + (Number(m.amount_usd) || 0), 0);

  const totalPendingUsd = approvedQuotes.reduce((acc, q) => {
    const collected = getCollectedForQuote(q.code);
    const balance = Math.max(0, q.total_usd - collected);
    return acc + balance;
  }, 0);

  const balanceUsd = totalCollectedUsd - totalExpensesUsd;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-amber-500" />
            Ventas y Compras
          </h2>
          <p className="text-zinc-500 font-medium mt-1">
            Gestión de ingresos por cotizaciones, gastos operativos y balance general.
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

      {/* 4 Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Cobros Registrados</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-2">${totalCollectedUsd.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Compras y Salidas</span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-red-600 mt-2">${totalExpensesUsd.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Saldos Pendientes</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600 mt-2">${totalPendingUsd.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Balance Registrado</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-3xl font-black mt-2 ${balanceUsd >= 0 ? 'text-zinc-900' : 'text-red-600'}`}>
            ${balanceUsd.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Grid 2 columnas: Izquierda Cobros Aprobados / Derecha Compras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna Izquierda: Cobros de Cotizaciones Aprobadas */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200 space-y-6">
          <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            Cobros de Cotizaciones Aprobadas
          </h3>

          {approvedQuotes.length === 0 ? (
            <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
              <FileText className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
              <p className="text-zinc-500 font-bold text-sm">Aprueba una cotización para registrar cobros.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {approvedQuotes.map(quote => {
                const collected = getCollectedForQuote(quote.code);
                const pending = Math.max(0, quote.total_usd - collected);
                const isFullyPaid = pending <= 0.01;

                return (
                  <div key={quote.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                            {quote.code}
                          </span>
                          <span className="font-bold text-zinc-900 text-sm">{quote.client_name}</span>
                        </div>
                        <p className="text-xs text-zinc-500 font-medium mt-1">{quote.job_name}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-zinc-900">${quote.total_usd.toFixed(2)}</span>
                        <span className="block text-[11px] text-zinc-400 font-semibold">
                          Cobrado: ${collected.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {isFullyPaid ? (
                      <div className="py-2 px-3 bg-emerald-100/70 text-emerald-800 font-bold text-xs rounded-xl text-center">
                        ✓ Totalmente Cobrado
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-1 border-t border-zinc-200/60">
                        <input
                          type="number"
                          step="0.01"
                          max={pending}
                          value={collectionAmounts[quote.id] || ''}
                          onChange={e => setCollectionAmounts({ ...collectionAmounts, [quote.id]: Number(e.target.value) })}
                          placeholder={`Monto ($) máx $${pending.toFixed(2)}`}
                          className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRegisterPayment(quote)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                        >
                          Registrar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha: Compras y Salidas Directas */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200 space-y-6">
          <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-500" />
            Compras y Salidas Directas
          </h3>

          <form onSubmit={handleRegisterDirectExpense} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase">Concepto de Gasto / Salida *</label>
              <input
                type="text"
                required
                value={concept}
                onChange={e => setConcept(e.target.value)}
                placeholder="Ej. Compra de tintas Plotter, Mantenimiento"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-amber-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase">Tipo de Movimiento</label>
                <select
                  value={movementType}
                  onChange={e => setMovementType(e.target.value)}
                  className="w-full px-3 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none"
                >
                  <option value="Compra directa">Compra directa</option>
                  <option value="Salida de caja">Salida de caja</option>
                  <option value="Insumos">Insumos de taller</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Servicios">Servicios y Fletes</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase">Monto ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={amountUsd}
                  onChange={e => setAmountUsd(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase">Tasa del Día (Bs/$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={exchangeRate}
                  onChange={e => setExchangeRate(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase">Pago en Bs (Opcional)</label>
                <input
                  type="number"
                  step="0.01"
                  value={pagoBs}
                  onChange={e => setPagoBs(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Auto si vacío"
                  className="w-full px-3 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl shadow-md transition-all text-sm mt-2"
            >
              Registrar Movimiento
            </button>
          </form>
        </div>
      </div>

      {/* Tabla Histórica de Movimientos */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200">
        <h3 className="text-xl font-bold text-zinc-900 mb-6">
          Histórico de Movimientos ({movements.length})
        </h3>

        {movements.length === 0 ? (
          <div className="p-12 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <Wallet className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500 font-bold text-lg">Aún no hay compras ni salidas registradas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Concepto</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Monto ($)</th>
                  <th className="py-3 px-4">Monto (Bs)</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm font-medium text-zinc-700">
                {movements.map(m => {
                  const isIncome = m.movement_type === 'Cobro cotización';
                  return (
                    <tr key={m.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-4 px-4 text-xs font-semibold text-zinc-500">
                        {m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Hoy'}
                      </td>
                      <td className="py-4 px-4 font-bold text-zinc-900">{m.concept}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                          isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {m.movement_type}
                        </span>
                      </td>
                      <td className={`py-4 px-4 font-black ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isIncome ? '+' : '-'}${m.amount_usd.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-zinc-500">
                        Bs. {m.amount_bs.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDeleteMovement(m.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal Reporte Imprimible */}
      {showPrintReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-2xl font-black text-zinc-900">Reporte Financiero de Taller</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Generado el {new Date().toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => setShowPrintReport(false)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs print:hidden"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-zinc-50 rounded-2xl text-center">
              <div>
                <p className="text-xs text-zinc-400 font-bold">Cobros Totales</p>
                <p className="text-lg font-black text-emerald-600">${totalCollectedUsd.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-bold">Gastos Totales</p>
                <p className="text-lg font-black text-red-600">${totalExpensesUsd.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-bold">Balance</p>
                <p className="text-lg font-black text-zinc-900">${balanceUsd.toFixed(2)}</p>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b font-bold text-zinc-500">
                  <th className="py-2">Fecha</th>
                  <th className="py-2">Concepto</th>
                  <th className="py-2">Tipo</th>
                  <th className="py-2">Monto ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y text-zinc-800">
                {movements.map(m => (
                  <tr key={m.id}>
                    <td className="py-2 font-mono">{m.created_at ? new Date(m.created_at).toLocaleDateString() : '-'}</td>
                    <td className="py-2 font-bold">{m.concept}</td>
                    <td className="py-2">{m.movement_type}</td>
                    <td className="py-2 font-bold">${m.amount_usd.toFixed(2)}</td>
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
                        <span class="summary-label">Cobros Totales</span>
                        <span class="summary-value" style="color: #059669;">$${totalCollectedUsd.toFixed(2)}</span>
                      </div>
                      <div class="summary-item">
                        <span class="summary-label">Gastos Totales</span>
                        <span class="summary-value" style="color: #dc2626;">$${totalExpensesUsd.toFixed(2)}</span>
                      </div>
                      <div class="summary-item">
                        <span class="summary-label">Balance Neto</span>
                        <span class="summary-value">$${balanceUsd.toFixed(2)}</span>
                      </div>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Concepto</th>
                          <th>Tipo</th>
                          <th style="text-align: right;">Monto ($)</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${movements.map(m => `
                          <tr>
                            <td>${m.created_at ? new Date(m.created_at).toLocaleDateString() : '-'}</td>
                            <td><strong>${m.concept}</strong></td>
                            <td>${m.movement_type}</td>
                            <td style="text-align: right; font-family: monospace; font-weight: bold;">$${m.amount_usd.toFixed(2)}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  `;
                  downloadAndPrintReport('Balance General de Ventas y Compras - Taller', bodyHtml, 'balance_ventas_compras_taller.html');
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
