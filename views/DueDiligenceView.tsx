import React, { useMemo, useState } from 'react';
import { DueDiligenceItem } from '../types';
import { UploadCloud, FileText, Trash2, Loader2, MessageSquare, X, Check, AlertCircle } from 'lucide-react';
import { uploadFile, getSignedViewUrl } from '../services/storage';

interface DueDiligenceViewProps {
  items: DueDiligenceItem[];
  onItemChange: (id: string, field: keyof DueDiligenceItem, value: any) => void;
}

export const DueDiligenceView: React.FC<DueDiligenceViewProps> = ({ items, onItemChange }) => {
  const [uploadingId, setUploadingId] = React.useState<string | null>(null);
  const [editItem, setEditItem] = useState<DueDiligenceItem | null>(null);
  const [tempObs, setTempObs] = useState('');

  const stats = useMemo(() => {
    const totalCritical = items.filter(i => i.isCritical).length;
    const criticalPending = items.filter(i => i.isCritical && i.status === 'Pendente').length;
    const completion = totalCritical > 0 ? Math.round(((totalCritical - criticalPending) / totalCritical) * 100) : 100;

    return { totalCritical, criticalPending, completion };
  }, [items]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadingId(id);

      try {
        // Upload to Supabase under "due-diligence" folder
        const { url, key } = await uploadFile(file, 'due-diligence');

        onItemChange(id, 'fileName', file.name);
        onItemChange(id, 'fileUrl', url);
        onItemChange(id, 'fileKey', key);
      } catch (error) {
        console.error("Upload failed", error);
        alert("Erro ao fazer upload para o Storage. Verifique se o bucket existe.");
      } finally {
        setUploadingId(null);
      }
    }
  };

  const removeFile = (id: string) => {
    onItemChange(id, 'fileName', undefined);
    onItemChange(id, 'fileUrl', undefined);
    onItemChange(id, 'fileKey', undefined);
  };

  const handleViewFile = async (item: DueDiligenceItem) => {
    try {
      const url = item.fileKey ? await getSignedViewUrl(item.fileKey) : item.fileUrl;
      if (url) window.open(url, '_blank');
    } catch (error) {
      console.error("Erro ao visualizar arquivo:", error);
      alert("Não foi possível gerar o link de visualização seguro.");
    }
  };

  const openObsModal = (item: DueDiligenceItem) => {
    setEditItem(item);
    setTempObs(item.observation || '');
  };

  const saveObs = () => {
    if (editItem) {
      onItemChange(editItem.id, 'observation', tempObs);
      setEditItem(null);
    }
  };

  const clearObs = () => {
    setTempObs('');
  };

  // Lock scroll on open
  useMemo(() => {
    if (typeof document !== 'undefined') {
      const main = document.querySelector('main');
      if (editItem && main) {
        main.style.overflow = 'hidden';
      } else if (main) {
        main.style.overflow = 'auto';
      }
    }
  }, [editItem]);

  return (
    <div className="space-y-6">
      {/* Dashboard Summary */}
      {/* Dashboard Summary - Modern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Críticos Totais</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-slate-800">{stats.totalCritical}</p>
            <span className="text-xs font-semibold text-slate-400">documentos</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Pendências Críticas</p>
          <div className="flex items-baseline gap-2">
            <p className={`text-3xl font-black ${stats.criticalPending > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {stats.criticalPending}
            </p>
            <div className={`w-2 h-2 rounded-full animate-pulse ${stats.criticalPending > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Completude Crítica</p>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${stats.completion === 100 ? 'bg-emerald-500' : 'bg-primary-blue'}`}
                style={{ width: `${stats.completion}%` }}
              ></div>
            </div>
            <span className="text-xl font-black text-slate-800">{stats.completion}%</span>
          </div>
        </div>

        <div className={`p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center transition-all duration-500 hover:scale-[1.05] ${stats.criticalPending === 0
          ? 'bg-emerald-600 shadow-emerald-200 text-white'
          : 'bg-rose-600 shadow-rose-200 text-white'
          }`}>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1 opacity-80">Final Result</span>
          <p className="text-2xl font-black tracking-tighter">
            {stats.criticalPending === 0 ? 'GO / APROVADO' : 'NO-GO / PENDENTE'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Checklist de Documentos</h3>
            <p className="text-xs text-slate-500 font-medium">Controle de qualidade e validação jurídica</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-full animate-pulse">
            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Atenção aos Críticos</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Categoria</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Documento / Verificação</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Crítico</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-40">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Anexo</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Data Receb.</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Validade</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-48">OBSERVAÇÃO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className={`group hover:bg-slate-50/80 transition-colors ${item.isCritical && item.status === 'Pendente' ? 'bg-rose-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-700 leading-tight">{item.description}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.isCritical ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-600 font-black text-[10px]">!</span>
                    ) : (
                      <span className="text-slate-300 font-bold">•</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={item.status}
                      onChange={(e) => onItemChange(item.id, 'status', e.target.value)}
                      className={`
                        block w-full text-[11px] font-bold rounded-xl border-none shadow-sm transition-all focus:ring-2 focus:ring-blue-500/20
                        ${item.status === 'Recebido' ? 'bg-emerald-50 text-emerald-600' : ''}
                        ${item.status === 'Pendente' ? 'bg-amber-50 text-amber-600 font-bold' : ''}
                        ${item.status === 'Não Aplicável' ? 'bg-slate-100 text-slate-400' : ''}
                      `}
                    >
                      <option value="Pendente">🟡 PENDENTE</option>
                      <option value="Recebido">🟢 RECEBIDO</option>
                      <option value="Não Aplicável">⚪ N/A</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {item.status === 'Recebido' ? (
                        item.fileName ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewFile(item)}
                              className="p-2 bg-ice-blue text-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition-all shadow-sm"
                            >
                              <FileText size={16} />
                            </button>
                            <button onClick={() => removeFile(item.id)} className="p-2 text-rose-400 hover:text-rose-600">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <label className={`p-2 rounded-lg cursor-pointer transition-all shadow-md ${uploadingId === item.id ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}>
                            {uploadingId === item.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <>
                                <input type="file" className="hidden" disabled={!!uploadingId} onChange={(e) => handleFileUpload(e, item.id)} />
                                <UploadCloud size={16} />
                              </>
                            )}
                          </label>
                        )
                      ) : (
                        <div className="p-2 bg-slate-100 text-slate-300 rounded-lg cursor-not-allowed">
                          <UploadCloud size={16} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="date"
                      value={item.dateReceived || ''}
                      onChange={(e) => onItemChange(item.id, 'dateReceived', e.target.value)}
                      className="text-[11px] font-medium text-slate-600 bg-transparent border-none focus:ring-0 p-0"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="date"
                      value={item.validity || ''}
                      onChange={(e) => onItemChange(item.id, 'validity', e.target.value)}
                      className="text-[11px] font-medium text-slate-600 bg-transparent border-none focus:ring-0 p-0"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openObsModal(item)}
                      className={`w-full text-left text-[11px] font-medium p-2 rounded-lg transition-all border border-transparent ${item.observation
                        ? 'text-slate-600 bg-blue-50/50 hover:bg-blue-50 group-hover:border-blue-100'
                        : 'text-slate-300 italic hover:text-slate-400'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare size={12} className={item.observation ? 'text-primary-blue' : 'opacity-20'} />
                        <span className="truncate max-w-[120px]">
                          {item.observation || 'Adicionar nota...'}
                        </span>
                      </div>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Observation Modal */}
      {editItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden transform animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-primary-blue rounded-xl">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Observação</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{editItem.category}</p>
                </div>
              </div>
              <button
                onClick={() => setEditItem(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6">
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex items-start gap-4">
                <AlertCircle size={20} className="text-primary-blue shrink-0 mt-1" />
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {editItem.description}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Conteúdo da Nota</label>
                <textarea
                  autoFocus
                  value={tempObs}
                  onChange={(e) => setTempObs(e.target.value)}
                  placeholder="Digite aqui os detalhes, pendências ou alertas sobre este item..."
                  className="w-full h-40 bg-slate-50 border-none rounded-2xl p-4 text-sm text-slate-700 focus:ring-2 focus:ring-primary-blue/20 transition-all resize-none placeholder-slate-300"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={clearObs}
                className="flex items-center gap-2 px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-xl font-bold text-xs transition-all"
              >
                <Trash2 size={16} />
                Limpar Texto
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditItem(null)}
                  className="px-6 py-2.5 text-slate-500 hover:bg-slate-200 rounded-xl font-bold text-xs transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveObs}
                  className="px-8 py-2.5 bg-primary-blue text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-2"
                >
                  <Check size={16} />
                  Salvar Nota
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};