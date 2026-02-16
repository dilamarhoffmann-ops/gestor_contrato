import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, ClipboardCheck, Printer, BarChart3, AlertTriangle, LogOut, User as UserIcon, AlertCircle, FileCheck, Settings, HelpCircle, Moon, Sun, X } from 'lucide-react';
import { NegotiationData, INITIAL_DATA, DueDiligenceItem, User } from './types';
import { INITIAL_DUE_DILIGENCE, INITIAL_USERS, REQUIRED_FIELDS, FIELD_TO_SECTION_MAP, FIELD_LABELS } from './constants';
import { calculateRisk, gerarTermSheet } from './services/riskCalculator';
import { NegotiationForm } from './views/NegotiationForm';
import { DueDiligenceView } from './views/DueDiligenceView';
import { TermSheetView } from './views/TermSheetView';
import { GeneralControlView } from './views/GeneralControlView';
import { RiskBadge } from './components/RiskBadge';
import { LoginView } from './views/LoginView';
import { ConfigurationView } from './views/ConfigurationView';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'control' | 'form' | 'dd' | 'termsheet' | 'config'>('control');
  const [formActiveSection, setFormActiveSection] = useState('1');
  const [data, setData] = useState<NegotiationData>(INITIAL_DATA);
  const [dueDiligence, setDueDiligence] = useState<DueDiligenceItem[]>(INITIAL_DUE_DILIGENCE);
  const [risk, setRisk] = useState(calculateRisk(INITIAL_DATA, INITIAL_DUE_DILIGENCE));
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [darkMode, setDarkMode] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string, name: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const termSheetStatus = gerarTermSheet(risk);

  // Recalculate risk whenever data changes
  useEffect(() => {
    setRisk(calculateRisk(data, dueDiligence));
  }, [data, dueDiligence]);

  // Load from Supabase (or localStorage fallback) on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        // 1. Carregar usuários do Supabase
        const { data: dbUsers, error: usersError } = await supabase
          .from('profiles')
          .select('*');

        if (usersError) throw usersError;

        let finalUsers = dbUsers || [];

        // 2. Se o banco estiver vazio, realizar Seed com INITIAL_USERS
        if (finalUsers.length === 0) {
          console.log('Banco de perfis vazio. Realizando seed inicial...');
          const { data: seededUsers, error: seedError } = await supabase
            .from('profiles')
            .insert(INITIAL_USERS.map(u => ({
              email: u.email.toLowerCase().trim(),
              name: u.name,
              password: u.password || '123',
              role: u.role,
              allowed: u.allowed,
              area: u.area,
              requires_password_change: u.requiresPasswordChange || false
            })))
            .select();

          if (seedError) {
            console.error('Erro ao realizar seed:', seedError);
          } else if (seededUsers) {
            finalUsers = seededUsers;
          }
        }

        // Normalização dos campos camelCase/snake_case vindos do banco
        const normalizedUsers: User[] = finalUsers.map((u: any) => ({
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role,
          allowed: u.allowed,
          area: u.area,
          requiresPasswordChange: u.requires_password_change
        }));

        setUsers(normalizedUsers);

        // First check Supabase for the most recent negotiation
        const { data: negs, error } = await supabase
          .from('negotiations')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (negs && negs.length > 0) {
          const neg = negs[0];
          setProjectId(neg.id);
          setData({
            ...neg.data,
            numeroProjeto: neg.numero_projeto || neg.data?.numeroProjeto || '001/2025'
          });
          setDueDiligence(neg.due_diligence);
        } else {
          // Fallback to localStorage if no Supabase data
          const savedData = localStorage.getItem('gestor_gn_data');
          const savedDD = localStorage.getItem('gestor_gn_dd');
          if (savedData) setData(JSON.parse(savedData));
          if (savedDD) setDueDiligence(JSON.parse(savedDD));
        }
      } catch (err) {
        console.error('Error loading dynamic data:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
    fetchProjects();

    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const fetchProjects = async () => {
    try {
      const { data: negs, error } = await supabase
        .from('negotiations')
        .select('id, numero_projeto, nome_projeto, updated_at, data, due_diligence')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setProjects(negs || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const handleLoadProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setProjectId(project.id);
      // Garante que o numeroProjeto do banco de dados seja usado, caso exista
      const projectData = {
        ...project.data,
        numeroProjeto: project.numero_projeto || project.data?.numeroProjeto || '001/2025'
      };
      setData(projectData);
      setDueDiligence(project.due_diligence);
      showToast(`Projeto "${project.nome_projeto || 'Sem nome'}" carregado com sucesso!`, 'success');
    }
  };

  const handleDataChange = (field: keyof NegotiationData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleDueDiligenceChange = (id: string, field: keyof DueDiligenceItem, value: any) => {
    setDueDiligence(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleNewProject = () => {
    setNewProjectModalOpen(true);
  };

  const confirmNewProject = () => {
    setProjectId(null);
    setData(INITIAL_DATA);
    setDueDiligence(INITIAL_DUE_DILIGENCE);
    setRisk(calculateRisk(INITIAL_DATA, INITIAL_DUE_DILIGENCE));
    setNewProjectModalOpen(false);
    setActiveTab('form');
    showToast('Iniciando novo projeto', 'info');
  };

  const handleOpenDeleteModal = (id: string, name: string) => {
    setProjectToDelete({ id, name });
    setDeleteConfirmText('');
    setDeleteModalOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    if (deleteConfirmText !== projectToDelete.name) {
      alert('O nome do projeto não corresponde. Exclusão cancelada.');
      return;
    }

    try {
      const { error } = await supabase
        .from('negotiations')
        .delete()
        .eq('id', projectToDelete.id);

      if (error) throw error;

      showToast(`Projeto "${projectToDelete.name}" excluído com sucesso!`, 'success');

      // If the deleted project is currently loaded, reset to new project
      if (projectId === projectToDelete.id) {
        setProjectId(null);
        setData(INITIAL_DATA);
        setDueDiligence(INITIAL_DUE_DILIGENCE);
      }

      // Refresh projects list
      fetchProjects();

      // Close modal
      setDeleteModalOpen(false);
      setProjectToDelete(null);
      setDeleteConfirmText('');
    } catch (err) {
      console.error('Error deleting project:', err);
      showToast('Erro ao excluir projeto. Verifique a conexão.', 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const handleSave = async () => {
    // Save to localStorage (legacy fallback)
    localStorage.setItem('gestor_gn_data', JSON.stringify(data));
    localStorage.setItem('gestor_gn_dd', JSON.stringify(dueDiligence));

    // Save to Supabase
    try {
      const payload = {
        numero_projeto: data.numeroProjeto,
        nome_projeto: data.nomeProjeto,
        data_prevista: data.dataPrevista || null,
        prioridade: data.prioridade,
        responsavel_comercial: data.responsavelComercial,
        data: data,
        due_diligence: dueDiligence,
        updated_at: new Date().toISOString()
      };

      let result;
      if (projectId) {
        result = await supabase
          .from('negotiations')
          .update(payload)
          .eq('id', projectId);
      } else {
        result = await supabase
          .from('negotiations')
          .insert([payload])
          .select();

        if (result.data?.[0]) {
          setProjectId(result.data[0].id);
        }
      }

      if (result.error) throw result.error;

      // Refresh projects list
      fetchProjects();

      // Show success feedback
      const btn = document.getElementById('save-btn');
      if (btn) {
        const originalText = btn.innerText;
        btn.innerText = '✓ Salvo no Cloud';
        btn.classList.replace('bg-deep-blue', 'bg-emerald-600');
        setTimeout(() => {
          if (btn) {
            btn.innerText = 'Salvar Alterações';
            btn.classList.replace('bg-emerald-600', 'bg-deep-blue');
          }
        }, 2000);
      }
    } catch (err) {
      console.error('Error saving to Supabase:', err);
      showToast('Erro ao salvar no banco de dados. Verifique a conexão.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNavigateToPending = () => {
    for (const field of REQUIRED_FIELDS) {
      const value = data[field];
      const isFilled =
        value !== undefined &&
        value !== null &&
        value !== '' &&
        (typeof value !== 'number' || value !== 0);

      if (!isFilled) {
        const section = FIELD_TO_SECTION_MAP[field];
        if (section) {
          setFormActiveSection(section);
          setActiveTab('form');
          const fieldLabel = FIELD_LABELS[field] || field;
          showToast(`Campo pendente: ${fieldLabel}`, 'info');
          return;
        }
      }
    }
    showToast('Todos os campos obrigatórios estão preenchidos!', 'success');
  };

  // User Management
  const handleAddUser = async (user: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([{
          email: user.email.toLowerCase().trim(),
          name: user.name,
          password: user.password,
          role: user.role,
          allowed: user.allowed,
          area: user.area,
          requires_password_change: user.requiresPasswordChange
        }]);

      if (error) throw error;

      setUsers(prev => [...prev, user]);
      showToast(`Usuário ${user.name} adicionado com sucesso`, 'success');
    } catch (err) {
      console.error('Error adding user:', err);
      showToast('Erro ao adicionar usuário no banco.', 'error');
    }
  };

  const handleUpdateUser = async (email: string, updates: Partial<User>) => {
    try {
      // Mapear campos camelCase para snake_case do banco
      const dbUpdates: any = { ...updates };
      if (updates.requiresPasswordChange !== undefined) {
        dbUpdates.requires_password_change = updates.requiresPasswordChange;
        delete dbUpdates.requiresPasswordChange;
      }

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('email', email.toLowerCase().trim());

      if (error) throw error;

      setUsers(prev => prev.map(u => u.email.toLowerCase().trim() === email.toLowerCase().trim() ? { ...u, ...updates } : u));

      // Se for o usuário atual, atualizar o estado do currentUser também
      if (currentUser && currentUser.email.toLowerCase().trim() === email.toLowerCase().trim()) {
        setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
      }

      showToast('Usuário atualizado com sucesso', 'success');
    } catch (err) {
      console.error('Error updating user:', err);
      showToast('Erro ao atualizar usuário no banco.', 'error');
    }
  };

  const handleRemoveUser = async (email: string) => {
    if (currentUser && currentUser.email.toLowerCase().trim() === email.toLowerCase().trim()) {
      showToast('Você não pode excluir seu próprio usuário.', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('email', email.toLowerCase().trim());

      if (error) throw error;

      setUsers(prev => prev.filter(u => u.email.toLowerCase().trim() !== email.toLowerCase().trim()));
      showToast('Usuário removido com sucesso', 'info');
    } catch (err) {
      console.error('Error removing user:', err);
      showToast('Erro ao remover usuário no banco.', 'error');
    }
  };

  if (!isAuthenticated) {
    return <LoginView
      users={users}
      onLogin={(user) => {
        setIsAuthenticated(true);
        setCurrentUser(user);
        setActiveTab('control');
      }}
      onRegister={handleAddUser}
      onForcePasswordChange={(email, pwd) => handleUpdateUser(email, { password: pwd, requiresPasswordChange: false })}
    />;
  }

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f8fafc]'}`}>

      {/* Sidebar - Modern Deep Dark Design */}
      <aside className="w-72 bg-deep-navy text-slate-400 flex flex-col fixed h-full z-20 shadow-2xl overflow-hidden print:hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-blue/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>

        {/* User Profile Section from Model */}
        <div className="p-8 flex flex-col items-center border-b border-slate-800/50 mb-4 relative">
          <div className="w-24 h-24 rounded-full bg-deep-blue border-4 border-slate-800 flex items-center justify-center mb-4 relative shadow-2xl">
            <UserIcon size={48} className="text-slate-400" />
            <div className={`absolute bottom-1 right-1 w-5 h-5 border-4 border-[#021024] rounded-full ${currentUser?.role === 'Gestor' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
          </div>
          <h2 className="text-xl font-bold text-white tracking-widest uppercase text-center">{currentUser?.name || 'USUÁRIO'}</h2>
          <p className="text-xs text-slate-500 font-medium lowercase mb-2">{currentUser?.email}</p>
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${currentUser?.role === 'Gestor' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
            {currentUser?.role}
          </span>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2 relative">
          <button
            onClick={() => setActiveTab('control')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl transition-all duration-300 group ${activeTab === 'control'
              ? 'bg-primary-blue text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <LayoutDashboard size={22} />
            <span className="text-sm font-medium tracking-wide">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('form')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl transition-all duration-300 group ${activeTab === 'form'
              ? 'bg-primary-blue text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <FileText size={22} />
            <span className="text-sm font-medium tracking-wide">Premissas</span>
          </button>

          <button
            onClick={() => setActiveTab('dd')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl transition-all duration-300 group ${activeTab === 'dd'
              ? 'bg-primary-blue text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <ClipboardCheck size={22} />
            <span className="text-sm font-medium tracking-wide">Due Diligence</span>
          </button>

          <button
            onClick={() => setActiveTab('termsheet')}
            className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl transition-all duration-300 group ${activeTab === 'termsheet'
              ? 'bg-primary-blue text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <Printer size={22} />
            <span className="text-sm font-medium tracking-wide">Term Sheet</span>
          </button>

          {/* Configuração Tab - ONLY FOR GESTOR */}
          {currentUser?.role === 'Gestor' && (
            <button
              onClick={() => setActiveTab('config')}
              className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl transition-all duration-300 group mt-4 border-t border-slate-800/50 pt-6 ${activeTab === 'config'
                ? 'bg-primary-blue text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <Settings size={22} />
              <span className="text-sm font-medium tracking-wide">Configuração</span>
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800/50 mt-auto">
          <button
            onClick={() => setLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-300 group"
          >
            <LogOut size={20} className="text-slate-500 group-hover:text-rose-400" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 ml-72 p-10 print:ml-0 print:p-0 transition-colors duration-300 ${darkMode ? 'bg-slate-950' : 'bg-ice-blue/20'} print:bg-white`}>

        {/* Header - Glassmorphism floating effect */}
        <header className="mb-10 flex justify-between items-end animate-slide-up print:hidden">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-1 bg-primary-blue rounded-full"></span>
              <span className="text-xs font-bold text-primary-blue uppercase tracking-widest">Workspace</span>
            </div>
            <h2 className={`text-4xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {activeTab === 'control' ? 'Dashboard' :
                activeTab === 'form' ? 'Premissas' :
                  activeTab === 'dd' ? 'Due Diligence' :
                    activeTab === 'termsheet' ? 'Term Sheet' :
                      'Configuração'}
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

          <div className="flex gap-4 items-center print:hidden">

            <button
              onClick={() => setHelpModalOpen(true)}
              className="p-3 bg-white/50 backdrop-blur-sm rounded-xl text-slate-500 hover:text-primary-blue hover:bg-white transition-all shadow-sm"
              title="Ajuda e Documentação"
            >
              <HelpCircle size={20} />
            </button>

            <button
              onClick={toggleDarkMode}
              className={`p-3 rounded-xl transition-all shadow-sm ${darkMode
                ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
                : 'bg-white/50 text-slate-500 hover:text-deep-blue hover:bg-white'
                }`}
              title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* View Content with Animation Container */}
        <div className="max-w-7xl pb-20">
          <div className="bg-white/40 backdrop-blur-2xl rounded-[3rem] border border-white/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden">
            <div className="p-10 min-h-[75vh] animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
                  <div className="w-12 h-12 border-4 border-primary-blue/20 border-t-primary-blue rounded-full animate-spin mb-4"></div>
                  <p className="font-medium animate-pulse text-primary-blue">Sincronizando com Supabase...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'control' && (
                    <GeneralControlView
                      data={data}
                      risk={risk}
                      dueDiligence={dueDiligence}
                      projects={projects}
                      onLoadProject={handleLoadProject}
                      onNewProject={handleNewProject}
                      onDeleteProject={handleOpenDeleteModal}
                      onNavigateToPending={handleNavigateToPending}
                    />
                  )}

                  {activeTab === 'form' && (
                    <NegotiationForm
                      data={data}
                      onChange={handleDataChange}
                      activeSection={formActiveSection}
                      onSectionChange={setFormActiveSection}
                    />
                  )}

                  {activeTab === 'dd' && (
                    <DueDiligenceView
                      items={dueDiligence}
                      onItemChange={handleDueDiligenceChange}
                    />
                  )}

                  {activeTab === 'termsheet' && (
                    <div className="flex justify-center bg-slate-100/50 -m-10 p-10 rounded-[3rem]">
                      <TermSheetView data={data} risk={risk} status={termSheetStatus} />
                    </div>
                  )}

                  {activeTab === 'config' && (
                    <ConfigurationView
                      users={users}
                      currentUser={currentUser}
                      onAddUser={handleAddUser}
                      onUpdateUser={handleUpdateUser}
                      onRemoveUser={handleRemoveUser}
                    />
                  )}
                </>
              )}
            </div>

            {!loading && (activeTab === 'form' || activeTab === 'dd') && (
              <div className="px-10 pb-10 flex justify-end">
                <button
                  id="save-btn"
                  onClick={handleSave}
                  className="px-12 py-4 bg-deep-blue text-white rounded-2xl hover:bg-primary-blue transition-all font-bold text-base shadow-xl shadow-deep-blue/20 active:scale-95 flex items-center gap-3 group"
                >
                  <FileText className="group-hover:rotate-12 transition-transform" size={20} />
                  Salvar Alterações do Projeto
                </button>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && projectToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Excluir Projeto</h3>
                <p className="text-sm text-slate-500">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-slate-700 mb-4">
                Você está prestes a excluir o projeto:
              </p>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900">{projectToDelete.name}</p>
              </div>
            </div>

            {/* Validation Input */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Para confirmar, digite o nome do projeto:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={projectToDelete.name}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors font-medium"
                autoFocus
              />
              {deleteConfirmText && deleteConfirmText !== projectToDelete.name && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  O nome não corresponde
                </p>
              )}
              {deleteConfirmText === projectToDelete.name && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <FileCheck size={12} />
                  Nome confirmado
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setProjectToDelete(null);
                  setDeleteConfirmText('');
                }}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={deleteConfirmText !== projectToDelete.name}
                className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${deleteConfirmText === projectToDelete.name
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
              >
                Excluir Projeto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Novo Projeto Modal */}
      {newProjectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 border border-white/20 transform animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary-blue/10 flex items-center justify-center">
                <FileText size={28} className="text-primary-blue" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Novo Projeto</h3>
                <p className="text-sm text-slate-500">Limpar dados atuais</p>
              </div>
            </div>

            {/* Content */}
            <div className="mb-8">
              <p className="text-slate-700 leading-relaxed">
                Deseja iniciar um novo projeto?
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Todos os dados preenchidos que não foram salvos serão perdidos permanentemente.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setNewProjectModalOpen(false)}
                className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all border-2 border-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmNewProject}
                className="flex-2 px-8 py-4 bg-primary-blue text-white rounded-2xl font-bold hover:bg-deep-blue transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                Sim, Novo Projeto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-8 right-8 z-[60] animate-in slide-in-from-top-5 fade-in duration-300">
          <div className={`
            min-w-[320px] max-w-md p-4 rounded-2xl shadow-2xl backdrop-blur-xl border-2
            flex items-center gap-4 transition-all
            ${toast.type === 'success'
              ? 'bg-emerald-500/95 border-emerald-400 text-white'
              : toast.type === 'error'
                ? 'bg-red-500/95 border-red-400 text-white'
                : 'bg-blue-500/95 border-blue-400 text-white'
            }
          `}>
            <div className="flex-shrink-0">
              {toast.type === 'success' && (
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <FileCheck size={20} className="text-white" />
                </div>
              )}
              {toast.type === 'error' && (
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <AlertCircle size={20} className="text-white" />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <AlertCircle size={20} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm leading-tight">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="flex-shrink-0 w-8 h-8 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>
        </div>
      )}
      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 border border-white/20 transform animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
                <LogOut size={28} className="text-rose-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Encerrar Sessão</h3>
                <p className="text-sm text-slate-500">Confirmação de saída</p>
              </div>
            </div>

            {/* Content */}
            <div className="mb-8">
              <p className="text-slate-700 leading-relaxed">
                Deseja realmente sair do sistema?
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Você precisará fazer login novamente para acessar seus projetos.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setLogoutModalOpen(false)}
                className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all border-2 border-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  setLogoutModalOpen(false);
                }}
                className="flex-2 px-8 py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <LogOut size={20} />
                Sair Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 relative">

            {/* Header */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                  <HelpCircle className="text-primary-blue" />
                  Central de Ajuda
                </h2>
                <p className="text-slate-500 mt-1">Entenda os indicadores e processos do sistema</p>
              </div>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="p-2 bg-slate-200 rounded-full hover:bg-rose-100 hover:text-rose-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-12">

              {/* Section 1: Indicadores */}
              <section className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-primary-blue">
                    <BarChart3 size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Indicadores de Preenchimento</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-primary-blue mb-4 flex items-center gap-2">
                      <FileCheck size={18} />
                      Completude Obrigatória
                    </h4>
                    <div className="space-y-4 text-sm text-slate-600">
                      <div>
                        <p className="font-bold text-slate-800 mb-1">O que é?</p>
                        <p>Mede a porcentagem do preenchimento mínimo essencial concluído no cadastro.</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 mb-1">Critério de Preenchimento</p>
                        <p>O sistema verifica uma lista de "Campos Obrigatórios". Considera-se preenchido se:</p>
                        <ul className="list-disc pl-4 mt-2 space-y-1 text-slate-500">
                          <li>Não estiver vazio ("")</li>
                          <li>Não for nulo</li>
                          <li>Números devem ser maiores que zero</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 mb-1">Fórmula</p>
                        <code className="px-2 py-1 bg-slate-200 rounded text-xs font-mono">(Preenchidos / Total) * 100</code>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-accent-orange mb-4 flex items-center gap-2">
                      <AlertCircle size={18} />
                      Pendências Obrigatórias
                    </h4>
                    <div className="space-y-4 text-sm text-slate-600">
                      <div>
                        <p className="font-bold text-slate-800 mb-1">O que indica?</p>
                        <p>Quantidade de campos vitais que ainda precisam de atenção. É a diferença entre o Total Obrigatório e os Preenchidos.</p>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 mb-1">Objetivo</p>
                        <p className="text-accent-orange font-bold">O objetivo é zerar este número.</p>
                        <p className="mt-1">Se maior que 0, o cadastro é considerado incompleto para análise.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="w-full h-px bg-slate-100"></div>

              {/* Section 2: Score de Risco */}
              <section className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-500">
                    <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Sistema de Risco Geral (Score)</h3>
                </div>

                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    O Score de Risco varia de <strong className="text-slate-900">0 a 100</strong>, somando pontos baseados em gatilhos Econômicos, Regulatórios, Dominiais e Ambientais.
                    A Due Diligence impacta diretamente: <span className="text-rose-500 font-bold">itens pendentes adicionam pontos de risco.</span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <h5 className="font-bold text-indigo-600 mb-3 text-sm uppercase tracking-wider">Econômico (Max 25)</h5>
                      <ul className="space-y-2 text-xs text-slate-500">
                        <li className="flex gap-2"><span>💰</span> <span>Investimento Alto + Prazo Curto (+10)</span></li>
                        <li className="flex gap-2"><span>📉</span> <span>Carência Insuficiente (+8)</span></li>
                        <li className="flex gap-2"><span>📊</span> <span>IGP-M (Volatilidade) (+5)</span></li>
                        <li className="flex gap-2"><span>🏗️</span> <span>Obras {'>'} 180 dias (+5)</span></li>
                      </ul>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <h5 className="font-bold text-purple-600 mb-3 text-sm uppercase tracking-wider">Regulatório (Max 25)</h5>
                      <ul className="space-y-2 text-xs text-slate-500">
                        <li className="flex gap-2"><span>⚖️</span> <span>Contrato com outra distribuidora (+7)</span></li>
                        <li className="flex gap-2"><span>📋</span> <span>Pendências de Due Diligence (Regulatório/Terceiros)</span></li>
                      </ul>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <h5 className="font-bold text-blue-600 mb-3 text-sm uppercase tracking-wider">Dominial (Max 25)</h5>
                      <ul className="space-y-2 text-xs text-slate-500">
                        <li className="flex gap-2"><span>🏠</span> <span>Locação Típica {'<'} 5 anos (+5)</span></li>
                        <li className="flex gap-2"><span>👥</span> <span>Proprietário Espólio/Múltiplos (+5)</span></li>
                        <li className="flex gap-2"><span>📄</span> <span>Pendências Imóvel/Fiador</span></li>
                      </ul>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <h5 className="font-bold text-emerald-600 mb-3 text-sm uppercase tracking-wider">Ambiental (Max 25)</h5>
                      <ul className="space-y-2 text-xs text-slate-500">
                        <li className="flex gap-2"><span>🛣️</span> <span>Rodovia (+10)</span></li>
                        <li className="flex gap-2"><span>☢️</span> <span>Histórico Contaminação (+5)</span></li>
                        <li className="flex gap-2"><span>🌳</span> <span>Pendências Licenças</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <div className="w-full h-px bg-slate-100"></div>

              {/* Section 3: Semáforo */}
              <section>
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                  <span className="text-2xl">🚦</span> Classificação e Níveis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 border border-green-200 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg shadow-green-500/30"></div>
                      <h4 className="font-bold text-green-800">Verde (Risco Baixo)</h4>
                    </div>
                    <p className="text-sm text-green-700">Term Sheet liberado automaticamente.</p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/30"></div>
                      <h4 className="font-bold text-yellow-800">Amarelo (Risco Médio)</h4>
                    </div>
                    <p className="text-sm text-yellow-700">Term Sheet gerado com <strong className="underline">alerta de revisão</strong>.</p>
                  </div>

                  <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/30"></div>
                      <h4 className="font-bold text-red-800">Vermelho (Risco Crítico)</h4>
                    </div>
                    <p className="text-sm text-red-700 font-bold">Bloqueia a geração do Term Sheet até mitigação.</p>
                  </div>
                </div>
              </section>

              <div className="w-full h-px bg-slate-100"></div>

              {/* Section 4: Indicador de Aprovação */}
              <section className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <ClipboardCheck size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Indicador de Aprovação (GO / NO-GO)</h3>
                </div>

                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>

                  <div className="grid md:grid-cols-2 gap-8 relative z-10">
                    <div>
                      <h4 className="font-bold text-slate-800 mb-4 text-lg">Como funciona?</h4>
                      <p className="text-slate-600 mb-4 leading-relaxed text-sm">
                        O indicador localizado no painel de Due Diligence é um <strong className="text-slate-900">gatilho de segurança binário</strong>. Ele monitora exclusivamente os itens marcados como <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded font-bold text-xs uppercase">Críticos</span> na lista de documentos.
                      </p>
                      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Regra Lógica</p>
                        <ul className="space-y-2 text-sm text-slate-700">
                          <li className="flex items-start gap-2">
                            <span className="text-rose-500 mt-1">🔴</span>
                            <span>
                              <strong>NO-GO / PENDENTE:</strong> Basta <strong>1 item crítico</strong> estar com status "Pendente" para bloquear a aprovação.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-emerald-500 mt-1">🟢</span>
                            <span>
                              <strong>GO / APROVADO:</strong> Todos os itens críticos devem estar "Recebido" ou "Não Aplicável".
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 mb-4 text-lg">Exemplos de Itens Críticos</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-xs">DOC</div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">Matrícula Atualizada (30 dias)</p>
                            <p className="text-[10px] text-slate-400 uppercase">Imóvel</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 font-bold text-xs">REG</div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">Alvará de Funcionamento / AVCB</p>
                            <p className="text-[10px] text-slate-400 uppercase">Regulatório</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 font-bold text-xs">AMB</div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">Licença de Operação (LO)</p>
                            <p className="text-[10px] text-slate-400 uppercase">Ambiental</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};


export default App;