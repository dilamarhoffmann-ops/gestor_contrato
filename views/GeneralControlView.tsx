import React, { useMemo } from 'react';
import { NegotiationData, RiskScore, DueDiligenceItem } from '../types';
import { AlertTriangle, TrendingUp, Wallet, FileCheck, MapPin, User, Calendar, AlertCircle, Activity } from 'lucide-react';

interface GeneralControlViewProps {
   data: NegotiationData;
   risk: RiskScore;
   dueDiligence: DueDiligenceItem[];
}

export const GeneralControlView: React.FC<GeneralControlViewProps> = ({ data, risk, dueDiligence }) => {

   // Helpers
   const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
   const formatNumber = (val: number) => new Intl.NumberFormat('pt-BR').format(val);

   // Stats Calculation
   const ddTotal = dueDiligence.length;
   const ddReceived = dueDiligence.filter(i => i.status === 'Recebido').length;
   const ddCriticalPending = dueDiligence.filter(i => i.isCritical && i.status === 'Pendente').length;
   const ddProgress = ddTotal > 0 ? Math.round((ddReceived / ddTotal) * 100) : 0;

   const riskColor = risk.level === 'Vermelho' ? 'text-red-600 bg-red-50 border-red-200' :
      risk.level === 'Amarelo' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
         'text-green-600 bg-green-50 border-green-200';

   const riskLabelColor = risk.level === 'Vermelho' ? 'bg-red-100 text-red-800' :
      risk.level === 'Amarelo' ? 'bg-yellow-100 text-yellow-800' :
         'bg-green-100 text-green-800';

   // Completeness Logic
   const completeness = useMemo(() => {
      let total = 0;
      let filled = 0;

      Object.entries(data).forEach(([key, value]) => {
         // Exclude metadata or non-input fields if necessary, 
         // here we count everything in data structure as a field to monitor.
         if (key === 'documentos' || key === 'terceiros' || key === 'tanques') {
            total++;
            if (Array.isArray(value) && value.length > 0) filled++;
         } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Recursive check for AddressData objects
            Object.values(value).forEach(v => {
               total++;
               if (v !== '' && v !== null && v !== undefined) filled++;
            });
         } else {
            total++;
            // Count valid values (assuming 0 is valid for some numeric fields, but empty string is not)
            if (value !== '' && value !== null && value !== undefined) {
               // For numbers, we might count 0 as empty if it's a mandatory value like price,
               // but keeping it simple: any defined value is "filled"
               filled++;
            }
         }
      });

      return {
         percentage: total > 0 ? Math.round((filled / total) * 100) : 0,
         pending: total - filled
      };
   }, [data]);

   return (
      <div className="space-y-6 animate-in fade-in duration-500">

         {/* Control Summary Table - Modern Row Layout */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Completude</p>
               <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-slate-800">{completeness.percentage}%</span>
                  <div className={`mb-1 w-2 h-2 rounded-full ${completeness.percentage > 80 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
               </div>
               <p className="text-[10px] text-slate-500 mt-2 italic line-clamp-1">Campos preenchidos</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pendências</p>
               <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-slate-800">{completeness.pending}</span>
                  <AlertCircle size={14} className="mb-2 text-slate-300" />
               </div>
               <p className="text-[10px] text-slate-500 mt-2 italic line-clamp-1">Campos em branco</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Score Risco</p>
               <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-slate-800">{risk.total}</span>
                  <span className="text-[10px] font-bold text-slate-400 mb-1">/100</span>
               </div>
               <p className="text-[10px] text-slate-500 mt-2 italic line-clamp-1">Pontuação atual</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Semáforo</p>
               <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${risk.level === 'Vermelho' ? 'bg-red-50 text-red-600' :
                        risk.level === 'Amarelo' ? 'bg-yellow-50 text-yellow-600' :
                           'bg-green-50 text-green-600'
                     }`}>
                     {risk.level}
                  </span>
               </div>
               <p className="text-[10px] text-slate-500 mt-2 italic line-clamp-1">Status de aprovação</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Projeto ID</p>
               <div className="flex items-end gap-2">
                  <span className="text-lg font-bold text-slate-800 truncate">{data.numeroProjeto || 'N/A'}</span>
               </div>
               <p className="text-[10px] text-slate-500 mt-2 italic line-clamp-1">Código sequencial</p>
            </div>
         </div>

         {/* Top Cards Row */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Risk Card */}
            <div className={`p-8 rounded-[2rem] border shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-500 hover:scale-[1.02] ${risk.level === 'Vermelho' ? 'bg-red-600 text-white border-red-400' :
                  risk.level === 'Amarelo' ? 'bg-amber-500 text-white border-amber-300' :
                     'bg-emerald-600 text-white border-emerald-400'
               }`}>
               <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
               <div>
                  <div className="flex justify-between items-start mb-4">
                     <h3 className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Risk Analysis</h3>
                     <AlertTriangle size={24} className="opacity-50" />
                  </div>
                  <div className="flex items-baseline gap-2 mb-6">
                     <span className="text-6xl font-black tracking-tighter">{risk.total}</span>
                     <span className="text-sm font-bold opacity-70">pts</span>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-widest opacity-90">
                     <div className="flex justify-between border-b border-white/20 pb-1">
                        <span>Dominial</span>
                        <span>{risk.breakdown.dominial}/25</span>
                     </div>
                     <div className="flex justify-between border-b border-white/20 pb-1">
                        <span>Ambiental</span>
                        <span>{risk.breakdown.ambiental}/25</span>
                     </div>
                     <div className="flex justify-between border-b border-white/20 pb-1">
                        <span>Regulatório</span>
                        <span>{risk.breakdown.regulatorio}/25</span>
                     </div>
                     <div className="flex justify-between border-b border-white/20 pb-1">
                        <span>Econômico</span>
                        <span>{risk.breakdown.economico}/25</span>
                     </div>
                  </div>
                  <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                     <div className="bg-white h-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${Math.min(risk.total, 100)}%` }}></div>
                  </div>
               </div>
            </div>

            {/* Economics Card */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
               <div className="flex justify-between items-start">
                  <div>
                     <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Economics</h3>
                     <p className="text-2xl font-bold text-gray-800">{formatCurrency(data.valorAluguelFixo)} <span className="text-xs font-normal text-gray-400">/mês</span></p>
                  </div>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                     <Wallet size={24} />
                  </div>
               </div>
               <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <div>
                     <p className="text-xs text-gray-500">CAPEX Estimado</p>
                     <p className="font-semibold text-gray-700">{formatCurrency(data.capexEstimado)}</p>
                  </div>
                  <div>
                     <p className="text-xs text-gray-500">Volume (L)</p>
                     <p className="font-semibold text-gray-700">{formatNumber(data.volumeMensal || data.volumeGalonagemMensal || 0)}</p>
                  </div>
               </div>
            </div>

            {/* Due Diligence Status */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
               <div className="flex justify-between items-start">
                  <div>
                     <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Due Diligence</h3>
                     <p className="text-2xl font-bold text-gray-800">{ddProgress}% <span className="text-xs font-normal text-gray-400">concluído</span></p>
                  </div>
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                     <FileCheck size={24} />
                  </div>
               </div>
               <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${ddCriticalPending > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {ddCriticalPending}
                     </div>
                     <div className="text-xs text-gray-600 leading-tight">
                        Itens Críticos<br />Pendentes
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-xs text-gray-500">Total Itens</p>
                     <p className="font-semibold text-gray-700">{ddTotal}</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Project Info */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
               <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="text-blue-500" size={20} />
                  Dados do Projeto
               </h3>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Nome do Projeto</p>
                     <p className="text-gray-900 font-medium text-lg">{data.nomeProjeto || 'Não informado'}</p>
                     <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${data.prioridade === 'Alta' ? 'bg-red-100 text-red-700' : data.prioridade === 'Média' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        Prioridade {data.prioridade}
                     </span>
                  </div>

                  <div>
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Localização</p>
                     <p className="text-gray-900">{data.endereco ? `${data.endereco}, ${data.numero}` : '-'}</p>
                     <p className="text-gray-600 text-sm">{data.cidade} - {data.uf}</p>
                     {data.tipoArea && <p className="text-xs text-gray-400 mt-1">{data.tipoArea} {data.zoneamento ? `• ${data.zoneamento}` : ''}</p>}
                  </div>

                  <div>
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><User size={12} /> Responsável Comercial</p>
                     <p className="text-gray-900">{data.responsavelComercial || '-'}</p>
                     <p className="text-gray-500 text-sm">{data.responsavelComercialEmail}</p>
                  </div>

                  <div>
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1 flex items-center gap-1"><Calendar size={12} /> Previsão</p>
                     <p className="text-gray-900">Início: {data.dataPrevista ? new Date(data.dataPrevista).toLocaleDateString('pt-BR') : '-'}</p>
                     <p className="text-gray-500 text-sm">Prazo Contrato: {data.prazoContratualMeses} meses</p>
                  </div>
               </div>
            </div>

            {/* Alerts / Triggers */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
               <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="text-orange-500" size={20} />
                  Pontos de Atenção
               </h3>

               <div className="space-y-3">
                  {risk.triggers.length === 0 && ddCriticalPending === 0 && (
                     <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <p>Nenhum alerta crítico.</p>
                     </div>
                  )}

                  {risk.triggers.map((trigger, idx) => (
                     <div key={`trig-${idx}`} className="flex gap-3 items-start p-3 bg-red-50 border border-red-100 rounded text-sm text-red-800">
                        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                        <span>{trigger}</span>
                     </div>
                  ))}

                  {ddCriticalPending > 0 && (
                     <div className="flex gap-3 items-start p-3 bg-orange-50 border border-orange-100 rounded text-sm text-orange-800">
                        <FileCheck size={16} className="mt-0.5 shrink-0" />
                        <span>Existem <strong>{ddCriticalPending} documentos críticos</strong> pendentes na Due Diligence.</span>
                     </div>
                  )}
               </div>
            </div>

         </div>
      </div>
   );
};