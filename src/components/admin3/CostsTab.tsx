import React, { useState } from 'react';
import { Panel3InternalCost } from './types';
import { Calculator, Plus, Trash2, Edit3, DollarSign, Info, Calendar, TrendingUp, Printer, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { downloadAndPrintReport } from '../../lib/printUtils';

interface CostsTabProps {
  costs: Panel3InternalCost[];
  setCosts: React.Dispatch<React.SetStateAction<Panel3InternalCost[]>>;
  dailyEstM2: number;
  setDailyEstM2: React.Dispatch<React.SetStateAction<number>>;
}

export const CostsTab: React.FC<CostsTabProps> = ({ costs, setCosts, dailyEstM2, setDailyEstM2 }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [concept, setConcept] = useState('');
  const [category, setCategory] = useState<'Costo fijo' | 'Costo variable'>('Costo fijo');
  const [period, setPeriod] = useState<'Mensual' | 'Semanal' | 'Diario'>('Mensual');
  const [amountUsd, setAmountUsd] = useState<number | ''>(200);
  const [showPrintReport, setShowPrintReport] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;

    const costData = {
      concept: concept.trim(),
      category,
      period,
      amount_usd: Number(amountUsd) || 0,
    };

    if (editingId) {
      await supabase.from('panel3_internal_costs').update(costData).eq('id', editingId);
      setCosts(costs.map(c => c.id === editingId ? { ...c, ...costData } : c));
      setEditingId(null);
    } else {
      const newObj: Panel3InternalCost = {
        id: crypto.randomUUID(),
        ...costData,
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('panel3_internal_costs').insert([newObj]).select().single();
      if (!error && data) {
        setCosts([data, ...costs]);
      } else {
        setCosts([newObj, ...costs]);
      }
    }

    setConcept('');
    setCategory('Costo fijo');
    setPeriod('Mensual');
    setAmountUsd(200);
  };

  const handleEdit = (c: Panel3InternalCost) => {
    setEditingId(c.id);
    setConcept(c.concept);
    setCategory(c.category);
    setPeriod(c.period);
    setAmountUsd(c.amount_usd);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este costo?')) return;
    await supabase.from('panel3_internal_costs').delete().eq('id', id);
    setCosts(costs.filter(c => c.id !== id));
  };

  const handleDailyM2Change = async (val: number) => {
    setDailyEstM2(val);
    await supabase.from('panel3_workshop_config').upsert({ key: 'daily_est_m2', value: val });
  };

  // Calculations
  const totalMonthlyCostUsd = costs.reduce((acc, item) => {
    let monthlyVal = item.amount_usd;
    if (item.period === 'Diario') monthlyVal = item.amount_usd * 30;
    if (item.period === 'Semanal') monthlyVal = item.amount_usd * 4.33;
    return acc + monthlyVal;
  }, 0);

  const dailyCostUsd = totalMonthlyCostUsd / 30;
  const recommendedPerM2 = dailyEstM2 > 0 ? dailyCostUsd / dailyEstM2 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
            <Calculator className="w-8 h-8 text-amber-500" />
            Costos Internos
          </h2>
          <p className="text-zinc-500 font-medium mt-1">
            Estructura de costos fijos y variables para calcular el precio interno recomendado por m².
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

      {/* Tarjetas Informativas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Costo Fijo Mensual Total</p>
            <p className="text-3xl font-black text-zinc-900 mt-0.5">${totalMonthlyCostUsd.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Costo Interno por Día</p>
            <p className="text-3xl font-black text-zinc-900 mt-0.5">${dailyCostUsd.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Costo Recomendado / m²</p>
            <p className="text-3xl font-black text-emerald-600 mt-0.5">${recommendedPerM2.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Formulario e Insumo de Producción */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200">
          <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-500" />
            {editingId ? 'Editar Costo' : 'Registrar Concepto de Costo'}
          </h3>

          <form 
            onSubmit={handleSave} 
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
                e.preventDefault();
              }
            }} 
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                  Concepto *
                </label>
                <input
                  type="text"
                  required
                  value={concept}
                  onChange={e => setConcept(e.target.value)}
                  placeholder="Ej. Alquiler de local, Electricidad, Sueldo Operador"
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-amber-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
                >
                  <option value="Costo fijo">Costo fijo</option>
                  <option value="Costo variable">Costo variable</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                  Periodo
                </label>
                <select
                  value={period}
                  onChange={e => setPeriod(e.target.value as any)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-800 outline-none"
                >
                  <option value="Mensual">Mensual</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Diario">Diario</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                  Monto ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={amountUsd}
                  onChange={e => setAmountUsd(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-amber-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl shadow-md transition-all text-sm"
              >
                {editingId ? 'Guardar Cambios' : 'Guardar Cálculo'}
              </button>
            </div>
          </form>
        </div>

        {/* Producción diaria & Explicación */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200">
            <h3 className="text-lg font-bold text-zinc-900 mb-4">
              Capacidad de Producción
            </h3>
            <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
              Producción estimada por día (m²)
            </label>
            <input
              type="number"
              min="1"
              value={dailyEstM2}
              onChange={e => handleDailyM2Change(Number(e.target.value) || 1)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-lg font-black text-amber-600 focus:bg-white focus:border-amber-500 transition-all outline-none mb-3"
            />
            <p className="text-xs text-zinc-500 font-medium leading-relaxed">
              Define cuántos m² es capaz de producir o imprimir tu taller diariamente.
            </p>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6">
            <div className="flex items-center gap-2 text-amber-900 font-bold mb-2">
              <Info className="w-5 h-5 text-amber-600" />
              ¿Cómo funciona este cálculo?
            </div>
            <p className="text-xs text-amber-800/90 leading-relaxed font-medium">
              Ejemplo: un costo fijo mensual de $200 se divide entre 30 días. Luego el costo diario se divide entre los m² estimados que produce el taller cada día. Este valor sirve para definir el precio de venta interno del material.
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de Costos */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200">
        <h3 className="text-xl font-bold text-zinc-900 mb-6">
          Estructura de Costos Registrados ({costs.length})
        </h3>

        {costs.length === 0 ? (
          <div className="p-12 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <Calculator className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500 font-bold text-lg">Registra los costos del taller para calcular el valor interno por m².</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Concepto</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Periodo</th>
                  <th className="py-3 px-4">Monto ($)</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm font-medium text-zinc-700">
                {costs.map(c => (
                  <tr key={c.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-zinc-900">{c.concept}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        c.category === 'Costo fijo' ? 'bg-amber-100 text-amber-800' : 'bg-cyan-100 text-cyan-800'
                      }`}>
                        {c.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-zinc-600 font-semibold">{c.period}</td>
                    <td className="py-4 px-4 font-black text-zinc-900">${c.amount_usd.toFixed(2)}</td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(c)}
                          className="p-2 text-zinc-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Modal Reporte Imprimible de Costos */}
      {showPrintReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-8 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-2xl font-black text-zinc-900">Estructura de Costos Internos de Taller</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Generado el {new Date().toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => setShowPrintReport(false)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs print:hidden"
              >
                Cerrar
              </button>
            </div>

            {/* Metric Summary */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-zinc-50 rounded-2xl border text-xs">
              <div>
                <span className="text-zinc-500 block font-medium">Costo Total Mensual</span>
                <span className="text-lg font-black text-zinc-900">${totalMonthlyCostUsd.toFixed(2)} USD</span>
              </div>
              <div>
                <span className="text-zinc-500 block font-medium">Costo Diario Operativo</span>
                <span className="text-lg font-black text-zinc-900">${dailyCostUsd.toFixed(2)} USD</span>
              </div>
              <div>
                <span className="text-zinc-500 block font-medium">Costo Recomendado / m²</span>
                <span className="text-lg font-black text-amber-600">${recommendedPerM2.toFixed(2)} USD</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b font-bold text-zinc-600 bg-zinc-50">
                    <th className="py-2.5 px-3">Concepto</th>
                    <th className="py-2.5 px-3">Categoría</th>
                    <th className="py-2.5 px-3">Período</th>
                    <th className="py-2.5 px-3 text-right">Monto (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-zinc-800">
                  {costs.map(c => (
                    <tr key={c.id}>
                      <td className="py-2.5 px-3 font-bold">{c.concept}</td>
                      <td className="py-2.5 px-3">{c.category}</td>
                      <td className="py-2.5 px-3">{c.period}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">${c.amount_usd.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t flex justify-end gap-3 print:hidden">
              <button
                onClick={() => {
                  const bodyHtml = `
                    <div class="summary-grid">
                      <div class="summary-item">
                        <span class="summary-label">Costo Total Mensual</span>
                        <span class="summary-value">$${totalMonthlyCostUsd.toFixed(2)} USD</span>
                      </div>
                      <div class="summary-item">
                        <span class="summary-label">Costo Diario Operativo</span>
                        <span class="summary-value">$${dailyCostUsd.toFixed(2)} USD</span>
                      </div>
                      <div class="summary-item">
                        <span class="summary-label">Costo Recomendado / m²</span>
                        <span class="summary-value" style="color: #d97706;">$${recommendedPerM2.toFixed(2)} USD</span>
                      </div>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Concepto</th>
                          <th>Categoría</th>
                          <th>Período</th>
                          <th style="text-align: right;">Monto (USD)</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${costs.map(c => `
                          <tr>
                            <td><strong>${c.concept}</strong></td>
                            <td>${c.category}</td>
                            <td>${c.period}</td>
                            <td style="text-align: right; font-family: monospace; font-weight: bold;">$${c.amount_usd.toFixed(2)}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  `;
                  downloadAndPrintReport('Estructura de Costos Internos de Taller', bodyHtml, 'costos_internos_taller.html');
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
