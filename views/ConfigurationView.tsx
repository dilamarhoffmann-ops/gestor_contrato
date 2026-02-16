import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Shield, UserPlus, Trash2, Check, X, Search, Lock, Unlock, Mail, Briefcase, Building, User as UserIcon, Key, RotateCcw } from 'lucide-react';

interface ConfigurationViewProps {
    users: User[];
    currentUser: User | null;
    onAddUser: (user: User) => void;
    onUpdateUser: (email: string, updates: Partial<User>) => void;
    onRemoveUser: (email: string) => void;
}

export const ConfigurationView: React.FC<ConfigurationViewProps> = ({
    users,
    currentUser,
    onAddUser,
    onUpdateUser,
    onRemoveUser
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState<User>({
        name: '',
        email: '',
        role: 'Usuario',
        allowed: true,
        area: '',
        password: '123'
    });

    const [showResetModal, setShowResetModal] = useState(false);
    const [resettingUser, setResettingUser] = useState<User | null>(null);
    const [newResetPassword, setNewResetPassword] = useState('123');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.area?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (users.some(u => u.email === newUser.email)) {
            alert('E-mail já cadastrado!');
            return;
        }
        onAddUser({ ...newUser, requiresPasswordChange: true });
        setShowAddModal(false);
        setNewUser({ name: '', email: '', role: 'Usuario', allowed: true, area: '', password: '123' });
    };

    const handleResetSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (resettingUser) {
            onUpdateUser(resettingUser.email, {
                password: newResetPassword,
                requiresPasswordChange: true
            });
            setShowResetModal(false);
            setResettingUser(null);
            setNewResetPassword('123');
            alert(`Senha de ${resettingUser.name} alterada com sucesso!`);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <Shield className="text-primary-blue" />
                        Configuração de Acessos
                    </h2>
                    <p className="text-slate-500 mt-1">Gerencie usuários, permissões e whitelists do sistema.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-primary-blue text-white rounded-xl font-bold hover:bg-deep-blue transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                >
                    <UserPlus size={20} />
                    Adicionar Usuário
                </button>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">

                {/* Search Bar */}
                <div className="mb-8 relative">
                    <Search className="absolute left-5 top-4 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, email ou área..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary-blue focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                    />
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-100">
                                <th className="pb-4 pl-4 font-bold text-xs uppercase text-slate-400 tracking-widest">Usuário</th>
                                <th className="pb-4 font-bold text-xs uppercase text-slate-400 tracking-widest">Área / Cargo</th>
                                <th className="pb-4 font-bold text-xs uppercase text-slate-400 tracking-widest text-center">Permissão</th>
                                <th className="pb-4 font-bold text-xs uppercase text-slate-400 tracking-widest text-center">Role</th>
                                <th className="pb-4 pr-4 font-bold text-xs uppercase text-slate-400 tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.email} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 pl-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${user.role === 'Gestor' ? 'bg-primary-blue text-white shadow-md shadow-blue-500/20' : 'bg-slate-200 text-slate-500'
                                                }`}>
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{user.name}</p>
                                                <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
                                            {user.area || 'Geral'}
                                        </span>
                                    </td>
                                    <td className="py-4 text-center">
                                        <button
                                            onClick={() => {
                                                if (currentUser?.email === user.email) return;
                                                onUpdateUser(user.email, { allowed: !user.allowed });
                                            }}
                                            disabled={currentUser?.email === user.email}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${user.allowed
                                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                                } ${currentUser?.email === user.email ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {user.allowed ? (
                                                <>
                                                    <Check size={14} /> Acesso Liberado
                                                </>
                                            ) : (
                                                <>
                                                    <Lock size={14} /> Bloqueado
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="py-4 text-center">
                                        <button
                                            onClick={() => {
                                                if (currentUser?.email === user.email) return;
                                                onUpdateUser(user.email, { role: user.role === 'Gestor' ? 'Usuario' : 'Gestor' });
                                            }}
                                            disabled={currentUser?.email === user.email}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${user.role === 'Gestor'
                                                ? 'bg-white border-primary-blue text-primary-blue hover:bg-blue-50'
                                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                } ${currentUser?.email === user.email ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {user.role === 'Gestor' ? <Shield size={14} /> : <UserIcon size={14} />}
                                            {user.role}
                                        </button>
                                    </td>
                                    <td className="py-4 pr-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => {
                                                    setResettingUser(user);
                                                    setShowResetModal(true);
                                                }}
                                                className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-all rounded-lg"
                                                title="Resetar Senha"
                                            >
                                                <RotateCcw size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (currentUser?.email === user.email) return;
                                                    setUserToDelete(user);
                                                    setShowDeleteModal(true);
                                                }}
                                                disabled={currentUser?.email === user.email}
                                                className={`p-2 transition-all rounded-lg ${currentUser?.email === user.email
                                                    ? 'text-slate-200 cursor-not-allowed'
                                                    : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                                                    }`}
                                                title={currentUser?.email === user.email ? "Você não pode excluir seu próprio usuário" : "Remover Usuário"}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search size={32} className="opacity-20" />
                                            <p className="font-medium">Nenhum usuário encontrado</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200 relative">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="mb-8 text-center">
                            <div className="inline-flex p-3 bg-blue-100 text-primary-blue rounded-2xl mb-4">
                                <UserPlus size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">Novo Usuário</h3>
                            <p className="text-sm text-slate-500">Adicione um novo membro à whitelist</p>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nome Completo</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
                                    <input
                                        required
                                        value={newUser.name}
                                        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl font-medium"
                                        placeholder="Nome do colaborador"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">E-mail Corporativo</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
                                    <input
                                        required
                                        type="email"
                                        value={newUser.email}
                                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl font-medium"
                                        placeholder="nome@empresa.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Área / Departamento</label>
                                <div className="relative">
                                    <Building className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
                                    <input
                                        required
                                        value={newUser.area}
                                        onChange={e => setNewUser({ ...newUser, area: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl font-medium"
                                        placeholder="Ex: Financeiro"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Perfil</label>
                                    <select
                                        value={newUser.role}
                                        onChange={e => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl font-medium appearance-none"
                                    >
                                        <option value="Usuario">Usuário</option>
                                        <option value="Gestor">Gestor</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Acesso Inicial</label>
                                    <select
                                        value={newUser.allowed ? 'true' : 'false'}
                                        onChange={e => setNewUser({ ...newUser, allowed: e.target.value === 'true' })}
                                        className="w-full px-4 py-3 bg-slate-50 rounded-xl font-medium appearance-none"
                                    >
                                        <option value="true">Liberado</option>
                                        <option value="false">Bloqueado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Senha Temporária</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
                                    <input
                                        required
                                        type="text"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl font-medium"
                                        placeholder="Defina uma senha"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 py-4 bg-primary-blue text-white rounded-xl font-bold hover:bg-deep-blue shadow-lg active:scale-95 transition-all"
                            >
                                Confirmar Cadastro
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200 relative border border-slate-100">
                        <button
                            onClick={() => setShowResetModal(false)}
                            className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="mb-6 text-center">
                            <div className="inline-flex p-3 bg-amber-100 text-amber-600 rounded-2xl mb-4">
                                <Key size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Resetar Senha</h3>
                            <p className="text-sm text-slate-500">Defina uma nova senha para <strong>{resettingUser?.name}</strong></p>
                        </div>

                        <form onSubmit={handleResetSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nova Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
                                    <input
                                        required
                                        type="text"
                                        value={newResetPassword}
                                        onChange={e => setNewResetPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl font-medium"
                                        placeholder="Nova senha temporária"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 py-4 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={18} />
                                Confirmar Reset
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete User Confirmation Modal */}
            {showDeleteModal && userToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative border border-white/20">
                        <button
                            onClick={() => {
                                setShowDeleteModal(false);
                                setUserToDelete(null);
                            }}
                            className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 text-center bg-rose-50/50">
                            <div className="inline-flex p-4 bg-rose-100 text-rose-500 rounded-2xl mb-4 animate-bounce">
                                <Trash2 size={32} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Remover Usuário</h2>
                            <p className="text-sm text-slate-500 mt-2">Esta ação é permanente e removerá todos os acessos de <strong>{userToDelete.name}</strong>.</p>
                        </div>

                        <div className="p-8 space-y-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                                    {userToDelete.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-800">{userToDelete.name}</p>
                                    <p className="text-xs text-slate-500">{userToDelete.email}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setUserToDelete(null);
                                    }}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        onRemoveUser(userToDelete.email);
                                        setShowDeleteModal(false);
                                        setUserToDelete(null);
                                    }}
                                    className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                                >
                                    Confirmar Remoção
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
