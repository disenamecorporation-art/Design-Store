import React, { useState } from 'react';
import { Panel3Client } from './types';
import { UserPlus, Trash2, Edit3, Users, Mail, Phone, MapPin, FileText, Printer, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { downloadAndPrintReport } from '../../lib/printUtils';

interface ClientsTabProps {
  clients: Panel3Client[];
  setClients: React.Dispatch<React.SetStateAction<Panel3Client[]>>;
}

export const ClientsTab: React.FC<ClientsTabProps> = ({ clients, setClients }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [rif, setRif] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPrintReport, setShowPrintReport] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const clientData = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      rif: rif.trim(),
      address: address.trim(),
    };

    if (editingId) {
      // Edit
      const { error } = await supabase.from('panel3_clients').update(clientData).eq('id', editingId);
      if (error) console.error('Error actualizando cliente:', error);
      setClients(clients.map(c => c.id === editingId ? { ...c, ...clientData } : c));
      setEditingId(null);
    } else {
      // Insert
      const newObj: Panel3Client = {
        id: crypto.randomUUID(),
        ...clientData,
        created_at: new Date().toISOString()
      };
      const { data, error } = await supabase.from('panel3_clients').insert([newObj]).select().single();
      if (!error && data) {
        setClients([data, ...clients]);
      } else {
        setClients([newObj, ...clients]);
      }
    }

    setName('');
    setPhone('');
    setEmail('');
    setRif('');
    setAddress('');
    setLoading(false);
  };

  const handleEdit = (client: Panel3Client) => {
    setEditingId(client.id);
    setName(client.name);
    setPhone(client.phone || '');
    setEmail(client.email || '');
    setRif(client.rif || '');
    setAddress(client.address || '');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar este cliente?')) return;
    await supabase.from('panel3_clients').delete().eq('id', id);
    setClients(clients.filter(c => c.id !== id));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setEmail('');
    setRif('');
    setAddress('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-amber-500" />
            Clientes
          </h2>
          <p className="text-zinc-500 font-medium mt-1">
            Gestiona el directorio de clientes para tus cotizaciones y facturas.
          </p>
        </div>
        <button
          onClick={() => setShowPrintReport(true)}
          className="px-5 py-3 bg-zinc-900 hover:bg-black text-white font-bold rounded-2xl shadow-md transition-all text-sm flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          Imprimir Directorio
        </button>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200">
        <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-amber-500" />
          {editingId ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
        </h3>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Nombre o Empresa *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. Inversiones Gráficas C.A."
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Teléfono
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Ej. +58 412 1234567"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ejemplo@cliente.com"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                RIF / Cédula
              </label>
              <input
                type="text"
                value={rif}
                onChange={e => setRif(e.target.value)}
                placeholder="Ej. J-12345678-0"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-zinc-600 mb-2 uppercase tracking-wider">
                Dirección Fiscal / Entrega
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Ej. Av. Principal, Edif. Centro, Piso 2, Caracas"
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm flex items-center gap-2"
            >
              {editingId ? 'Guardar Cambios' : 'Agregar Cliente'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-5 py-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-bold rounded-xl transition-all text-sm"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200">
        <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
          Directorio de Clientes ({clients.length})
        </h3>

        {clients.length === 0 ? (
          <div className="p-12 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
            <Users className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500 font-bold text-lg">Agrega tu primer cliente.</p>
            <p className="text-zinc-400 text-sm mt-1">Usa el formulario superior para registrar clientes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Cliente / Empresa</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4">Correo</th>
                  <th className="py-3 px-4">RIF</th>
                  <th className="py-3 px-4">Dirección</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm font-medium text-zinc-700">
                {clients.map(client => (
                  <tr key={client.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-zinc-900">{client.name}</td>
                    <td className="py-4 px-4 text-zinc-600">
                      {client.phone ? (
                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-zinc-400" />{client.phone}</span>
                      ) : '-'}
                    </td>
                    <td className="py-4 px-4 text-zinc-600">
                      {client.email ? (
                        <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-zinc-400" />{client.email}</span>
                      ) : '-'}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-zinc-600">
                      {client.rif ? (
                        <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-zinc-400" />{client.rif}</span>
                      ) : '-'}
                    </td>
                    <td className="py-4 px-4 text-zinc-600 max-w-xs truncate">
                      {client.address ? (
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />{client.address}</span>
                      ) : '-'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(client)}
                          className="p-2 text-zinc-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Modal Reporte Imprimible de Clientes */}
      {showPrintReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-8 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-2xl font-black text-zinc-900">Directorio de Clientes de Taller</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Generado el {new Date().toLocaleDateString()} — Total: {clients.length} clientes</p>
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
                    <th className="py-2.5 px-3">Cliente / Empresa</th>
                    <th className="py-2.5 px-3">RIF / CI</th>
                    <th className="py-2.5 px-3">Teléfono</th>
                    <th className="py-2.5 px-3">Correo</th>
                    <th className="py-2.5 px-3">Dirección</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-zinc-800">
                  {clients.map(c => (
                    <tr key={c.id}>
                      <td className="py-2.5 px-3 font-bold">{c.name}</td>
                      <td className="py-2.5 px-3 font-mono">{c.rif || '-'}</td>
                      <td className="py-2.5 px-3">{c.phone || '-'}</td>
                      <td className="py-2.5 px-3">{c.email || '-'}</td>
                      <td className="py-2.5 px-3">{c.address || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t flex justify-end gap-3 print:hidden">
              <button
                onClick={() => {
                  const tableHtml = `
                    <table>
                      <thead>
                        <tr>
                          <th>Cliente / Empresa</th>
                          <th>RIF / CI</th>
                          <th>Teléfono</th>
                          <th>Correo</th>
                          <th>Dirección</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${clients.map(c => `
                          <tr>
                            <td><strong>${c.name}</strong></td>
                            <td>${c.rif || '-'}</td>
                            <td>${c.phone || '-'}</td>
                            <td>${c.email || '-'}</td>
                            <td>${c.address || '-'}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  `;
                  downloadAndPrintReport('Directorio de Clientes de Taller', tableHtml, 'directorio_clientes_taller.html');
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
