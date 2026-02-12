import { DueDiligenceItem } from '../types';
import { UploadCloud, FileText, Trash2, Loader2 } from 'lucide-react';
import { uploadFileToS3 } from '../services/s3';

interface DueDiligenceViewProps {
  items: DueDiligenceItem[];
  onItemChange: (id: string, field: keyof DueDiligenceItem, value: any) => void;
}

export const DueDiligenceView: React.FC<DueDiligenceViewProps> = ({ items, onItemChange }) => {
  const [uploadingId, setUploadingId] = React.useState<string | null>(null);

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
        // Upload to S3 under "due-diligence" folder
        const s3Url = await uploadFileToS3(file, 'due-diligence');

        onItemChange(id, 'fileName', file.name);
        onItemChange(id, 'fileUrl', s3Url);
      } catch (error) {
        console.error("Upload failed", error);
        alert("Erro ao fazer upload para S3. Verifique as credenciais e o CORS.");
      } finally {
        setUploadingId(null);
      }
    }
  };

  const removeFile = (id: string) => {
    onItemChange(id, 'fileName', undefined);
    onItemChange(id, 'fileUrl', undefined);
  };

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
                className={`h-full transition-all duration-1000 ${stats.completion === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
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
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Anexo</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Validade</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 w-48">Obs</th>
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
                            <a href={item.fileUrl} target="_blank" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                              <FileText size={16} />
                            </a>
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
                      value={item.validity || ''}
                      onChange={(e) => onItemChange(item.id, 'validity', e.target.value)}
                      className="text-[11px] font-medium text-slate-600 bg-transparent border-none focus:ring-0 p-0"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={item.observation || ''}
                      onChange={(e) => onItemChange(item.id, 'observation', e.target.value)}
                      placeholder="+"
                      className="w-full text-[11px] font-medium text-slate-500 bg-transparent border-none focus:ring-0 italic placeholder-slate-300"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};