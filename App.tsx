import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, ClipboardCheck, Printer, BarChart3, AlertTriangle } from 'lucide-react';
import { NegotiationData, INITIAL_DATA, DueDiligenceItem } from './types';
import { INITIAL_DUE_DILIGENCE } from './constants';
import { calculateRisk } from './services/riskCalculator';
import { NegotiationForm } from './views/NegotiationForm';
import { DueDiligenceView } from './views/DueDiligenceView';
import { TermSheetView } from './views/TermSheetView';
import { GeneralControlView } from './views/GeneralControlView';
import { RiskBadge } from './components/RiskBadge';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'control' | 'form' | 'dd' | 'termsheet'>('control');
  const [data, setData] = useState<NegotiationData>(INITIAL_DATA);
  const [dueDiligence, setDueDiligence] = useState<DueDiligenceItem[]>(INITIAL_DUE_DILIGENCE);
  const [risk, setRisk] = useState(calculateRisk(INITIAL_DATA));

  // Recalculate risk whenever data changes
  useEffect(() => {
    setRisk(calculateRisk(data));
  }, [data]);

  const handleDataChange = (field: keyof NegotiationData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleDueDiligenceChange = (id: string, field: keyof DueDiligenceItem, value: any) => {
    setDueDiligence(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">

      {/* Sidebar - Modern Deep Dark Design */}
      <aside className="w-72 bg-[#0f172a] text-slate-400 flex flex-col fixed h-full z-20 shadow-2xl overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>

        <div className="p-8 relative">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Gestor GN</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Premium Ops</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1.5 relative">
          <button
            onClick={() => setActiveTab('control')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${activeTab === 'control'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'hover:bg-slate-800/50 hover:text-slate-200'
              }`}
          >
            <LayoutDashboard size={20} className={activeTab === 'control' ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} />
            <span className="font-medium">Controle Geral</span>
          </button>

          <button
            onClick={() => setActiveTab('form')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${activeTab === 'form'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'hover:bg-slate-800/50 hover:text-slate-200'
              }`}
          >
            <FileText size={20} className={activeTab === 'form' ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} />
            <span className="font-medium">Premissas</span>
          </button>

          <button
            onClick={() => setActiveTab('dd')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${activeTab === 'dd'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'hover:bg-slate-800/50 hover:text-slate-200'
              }`}
          >
            <ClipboardCheck size={20} className={activeTab === 'dd' ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} />
            <span className="font-medium">Due Diligence</span>
          </button>

          <button
            onClick={() => setActiveTab('termsheet')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${activeTab === 'termsheet'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'hover:bg-slate-800/50 hover:text-slate-200'
              }`}
          >
            <Printer size={20} className={activeTab === 'termsheet' ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} />
            <span className="font-medium">Term Sheet</span>
          </button>
        </nav>

        {/* Live Risk Widget - Enhanced */}
        <div className="p-6 relative">
          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Risk Score</span>
              <RiskBadge level={risk.level} score={risk.total} />
            </div>

            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${risk.level === 'Vermelho' ? 'text-red-400 bg-red-400/10' :
                      risk.level === 'Amarelo' ? 'text-yellow-400 bg-yellow-400/10' :
                        'text-green-400 bg-green-400/10'
                    }`}>
                    {risk.level} Level
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold inline-block text-white">
                    {risk.total}/100
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-1 text-xs flex rounded-full bg-slate-700">
                <div
                  style={{ width: `${Math.min(risk.total, 100)}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${risk.level === 'Vermelho' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' :
                      risk.level === 'Amarelo' ? 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]' :
                        'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                    }`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-72 p-10">

        {/* Header - Glassmorphism floating effect */}
        <header className="mb-10 flex justify-between items-end animate-slide-up">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Workspace</span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'control' ? 'Dashboard' :
                activeTab === 'form' ? 'Premissas' :
                  activeTab === 'dd' ? 'Due Diligence' :
                    'Term Sheet'}
            </h2>
            <p className="text-slate-500 mt-2 font-medium">
              {data.nomeProjeto ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  {data.nomeProjeto}
                </span>
              ) : 'Novo Projeto de Negociação'}
            </p>
          </div>

          <div className="flex gap-4 items-center">
            <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-semibold text-sm shadow-sm">
              Rascunho
            </button>
            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold text-sm shadow-md shadow-blue-600/20 active:scale-95">
              Salvar Alterações
            </button>
          </div>
        </header>

        {/* View Content with Animation Container */}
        <div className="max-w-7xl pb-20">
          <div className="bg-white/40 backdrop-blur-2xl rounded-[3rem] border border-white/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="p-10 min-h-[75vh] animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {activeTab === 'control' && (
                <GeneralControlView data={data} risk={risk} dueDiligence={dueDiligence} />
              )}

              {activeTab === 'form' && (
                <NegotiationForm data={data} onChange={handleDataChange} />
              )}

              {activeTab === 'dd' && (
                <DueDiligenceView
                  items={dueDiligence}
                  onItemChange={handleDueDiligenceChange}
                />
              )}

              {activeTab === 'termsheet' && (
                <div className="flex justify-center bg-slate-100/50 -m-10 p-10 rounded-[3rem]">
                  <TermSheetView data={data} risk={risk} />
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );

};

export default App;