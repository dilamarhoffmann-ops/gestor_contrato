import React, { useMemo } from 'react';
import { NegotiationData, RiskScore, DueDiligenceItem } from '../types';
import { REQUIRED_FIELDS } from '../constants';
import { AlertTriangle, TrendingUp, Wallet, FileCheck, MapPin, User, Calendar, AlertCircle, Activity, FolderOpen, Database, ArrowRight, Clock, Trash2, FileText } from 'lucide-react';

interface GeneralControlViewProps {
   data: NegotiationData;
   risk: RiskScore;
   dueDiligence: DueDiligenceItem[];
   projects: any[];
   onLoadProject: (id: string) => void;
   onNewProject: () => void;
   onDeleteProject: (id: string, name: string) => void;
   onNavigateToPending: () => void;
}

export const GeneralControlView: React.FC<GeneralControlViewProps> = ({ data, risk, dueDiligence, projects, onLoadProject, onNewProject, onDeleteProject, onNavigateToPending }) => {

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
      let total = REQUIRED_FIELDS.length;
      let filled = 0;

      REQUIRED_FIELDS.forEach(field => {
         const value = data[field];
         // Check for defined, non-null, non-empty string, and non-zero number
         const isFilled =
            value !== undefined &&
            value !== null &&
            value !== '' &&
            (typeof value !== 'number' || value !== 0);

         if (isFilled) {
            filled++;
         }
      });

      return {
         percentage: total > 0 ? Math.round((filled / total) * 100) : 0,
         pending: total - filled
      };
   }, [data]);

   return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
         {/* Title Area */}
         <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Painel de Gerenciamento</h2>
            <div className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
               <Activity size={20} className="text-slate-400" />
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Main Content (Left 9 Columns) */}
            <div className="lg:col-span-9 space-y-8">


               {/* Controle Geral Block */}
               <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl relative">
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-lg font-bold text-slate-800 tracking-tight">Controle Geral</h3>
                  </div>

                  {/* Grid de Métricas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {/* Card 1: Completude Obrigatória */}
                     <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 relative overflow-hidden group hover:shadow-lg transition-shadow">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-primary-blue/10 rounded-full blur-2xl"></div>
                        <div className="relative">
                           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Completude Obrigatória</p>
                           <div className="flex items-baseline gap-2 mb-3">
                              <span className="text-4xl font-black text-deep-blue">{completeness.percentage}</span>
                              <span className="text-lg font-bold text-slate-400">%</span>
                           </div>
                           <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                 className="h-full bg-gradient-to-r from-primary-blue to-deep-blue rounded-full transition-all duration-1000"
                                 style={{ width: `${completeness.percentage}%` }}
                              ></div>
                           </div>
                        </div>
                     </div>

                     {/* Card 2: Pendências Obrigatórias */}
                     <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 relative overflow-hidden group hover:shadow-lg transition-shadow">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-accent-orange/10 rounded-full blur-2xl"></div>
                        <div className="relative">
                           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Pendências Obrigatórias</p>
                           <div className="flex items-baseline gap-2 mb-3">
                              <span className="text-4xl font-black text-accent-orange">{completeness.pending}</span>
                              <span className="text-lg font-bold text-slate-400">campos</span>
                           </div>
                           <p className="text-xs text-slate-500 font-medium">
                              {completeness.pending === 0 ? '✓ Todos os campos preenchidos' : `${completeness.pending} campo${completeness.pending > 1 ? 's' : ''} em branco`}
                           </p>
                        </div>
                     </div>

                     {/* Card 3: Risco Geral */}
                     <div className={`p-6 rounded-2xl border relative overflow-hidden group hover:shadow-lg transition-shadow ${risk.level === 'Verde' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100' :
                        risk.level === 'Amarelo' ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-100' :
                           'bg-gradient-to-br from-red-50 to-rose-50 border-red-100'
                        }`}>
                        <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl ${risk.level === 'Verde' ? 'bg-green-500/10' :
                           risk.level === 'Amarelo' ? 'bg-yellow-500/10' :
                              'bg-red-500/10'
                           }`}></div>
                        <div className="relative">
                           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Risco Geral</p>
                           <div className="flex items-baseline gap-2 mb-3">
                              <span className={`text-4xl font-black ${risk.level === 'Verde' ? 'text-green-600' :
                                 risk.level === 'Amarelo' ? 'text-yellow-600' :
                                    'text-red-600'
                                 }`}>{risk.total}</span>
                              <span className="text-lg font-bold text-slate-400">/100</span>
                           </div>
                           <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${risk.level === 'Verde' ? 'bg-green-100 text-green-700' :
                              risk.level === 'Amarelo' ? 'bg-yellow-100 text-yellow-700' :
                                 'bg-red-100 text-red-700'
                              }`}>
                              <span className={`w-2 h-2 rounded-full ${risk.level === 'Verde' ? 'bg-green-500' :
                                 risk.level === 'Amarelo' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                 }`}></span>
                              {risk.level}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Número do Projeto */}
                  <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-deep-blue/10 flex items-center justify-center">
                              <FileText size={20} className="text-deep-blue" />
                           </div>
                           <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Número do Projeto</p>
                              <p className="text-lg font-black text-slate-800">{data.numeroProjeto || 'Não definido'}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nome do Projeto</p>
                           <p className="text-sm font-bold text-slate-700">{data.nomeProjeto || 'Sem nome'}</p>
                        </div>
                     </div>
                  </div>
               </div>


               {/* Saved Projects Section */}
               <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-blue/10 rounded-xl text-primary-blue">
                           <Database size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Projetos Recentes</h3>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{projects.length} registros</span>
                        <button
                           onClick={onNewProject}
                           className="px-4 py-2 bg-primary-blue text-white rounded-xl font-bold hover:bg-deep-blue transition-all shadow-md flex items-center gap-2 text-sm"
                        >
                           <FolderOpen size={16} />
                           Novo Projeto
                        </button>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {projects.length > 0 ? (
                        projects.slice(0, 4).map((project: any) => (
                           <div
                              key={project.id}
                              className="group p-4 rounded-2xl border border-slate-50 hover:border-primary-blue/30 hover:bg-primary-blue/5 transition-all flex items-center justify-between"
                           >
                              <div
                                 onClick={() => onLoadProject(project.id)}
                                 className="flex items-center gap-4 flex-1 cursor-pointer"
                              >
                                 <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-primary-blue transition-colors">
                                    <FolderOpen size={18} />
                                 </div>
                                 <div className="overflow-hidden">
                                    <h4 className="font-bold text-slate-800 text-sm truncate">{project.nome_projeto || 'Sem título'}</h4>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                       <Clock size={10} />
                                       <span>{new Date(project.updated_at).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-2">
                                 <button
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       onDeleteProject(project.id, project.nome_projeto || 'Sem título');
                                    }}
                                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                    title="Excluir projeto"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                                 <ArrowRight size={16} className="text-slate-300 group-hover:text-primary-blue group-hover:translate-x-1 transition-all" />
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="col-span-2 py-10 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                           <Database size={32} className="mx-auto mb-2 opacity-20" />
                           <p className="text-sm font-medium">Nenhum projeto salvo encontrado.</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Right Sidebar (3 Columns) */}
            <div className="lg:col-span-3 space-y-8">
               {/* Donut Chart Block */}
               <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl flex flex-col items-center">
                  <div className="relative w-40 h-40 flex items-center justify-center mb-8">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="15" />
                        <circle cx="80" cy="80" r="70" fill="none" stroke="#052659" strokeWidth="15"
                           strokeDasharray={440} strokeDashoffset={440 - (440 * completeness.percentage) / 100}
                           strokeLinecap="round" className="transition-all duration-1000" />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-slate-800">{completeness.percentage}%</span>
                     </div>
                  </div>


                  <div className="w-full space-y-4">
                     {['Dados Gerais', 'Localização', 'Operacional', 'Partes'].map((step, idx) => (
                        <div key={step} className="flex flex-col gap-1">
                           <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                              <span>{step}</span>
                              <span className="text-slate-800">{idx === 0 ? '100%' : idx === 1 ? '85%' : '40%'}</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-accent-orange" style={{ width: idx === 0 ? '100%' : idx === 1 ? '85%' : '40%' }}></div>
                           </div>
                        </div>
                     ))}
                  </div>

                  <button
                     onClick={onNavigateToPending}
                     className="w-full mt-8 py-3 bg-accent-orange text-white rounded-2xl font-bold uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all text-xs">
                     Completar Cadastro
                  </button>
               </div>

               {/* Alerts Section */}
               <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <AlertTriangle size={16} className="text-accent-orange" />
                     Pontos de Atenção
                  </h3>
                  <div className="space-y-4">
                     {risk.triggers.slice(0, 3).map((trigger, i) => (
                        <div key={i} className="p-3 bg-red-50/50 border-l-4 border-red-500 rounded-r-xl">
                           <p className="text-[10px] font-bold text-red-900 leading-tight">{trigger}</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};