import React, { useState } from 'react';
import { Mail, Lock, LogIn, ShieldCheck, ArrowRight, X, User as UserIcon, Briefcase, Building, AlertCircle, Key, Fingerprint, CheckCircle2 } from 'lucide-react';

import { User } from '../types';

interface LoginViewProps {
    onRegister: (user: User) => void;
    onForcePasswordChange: (email: string, newPassword: string) => void;
    users: User[];
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onRegister, onForcePasswordChange, users }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [regData, setRegData] = useState({ name: '', email: '', area: '', role: 'Usuario' as const, password: '', confirmPassword: '' });
    const [isRegLoading, setIsRegLoading] = useState(false);
    const [error, setError] = useState('');
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [regError, setRegError] = useState('');
    const [showContactGestorModal, setShowContactGestorModal] = useState(false);
    const [showForceChange, setShowForceChange] = useState(false);
    const [forceChangeData, setForceChangeData] = useState({ newPassword: '', confirmPassword: '' });
    const [forceChangeUser, setForceChangeUser] = useState<User | null>(null);
    const [forceChangeError, setForceChangeError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Por favor, insira um formato de e-mail válido.');
            setErrorModalOpen(true);
            setIsLoading(false);
            return;
        }

        setTimeout(() => {
            const user = users.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());

            if (user) {
                const storedPassword = String(user.password || '').trim();
                const providedPassword = String(password || '').trim();

                if (!user.allowed) {
                    setError('Acesso bloqueado. Entre em contato com o administrador para liberação.');
                    setErrorModalOpen(true);
                    setIsLoading(false);
                } else if (storedPassword && storedPassword !== providedPassword) {
                    setError('Senha incorreta. Verifique suas credenciais e tente novamente.');
                    setErrorModalOpen(true);
                    setIsLoading(false);
                } else if (!storedPassword && providedPassword !== '') {
                    setError('Este usuário ainda não possui uma senha definida. Use o cadastro para definir uma ou contate o suporte.');
                    setErrorModalOpen(true);
                    setIsLoading(false);
                } else {
                    setIsLoading(false);
                    if (user.requiresPasswordChange) {
                        setForceChangeUser(user);
                        setShowForceChange(true);
                    } else {
                        onLogin(user);
                    }
                }
            } else {
                setError('E-mail não encontrado ou não cadastrado no sistema.');
                setErrorModalOpen(true);
                setIsLoading(false);
            }
        }, 800);
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setRegError('');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(regData.email)) {
            setRegError('Por favor, insira um e-mail válido.');
            return;
        }

        if (regData.password.length < 6) {
            setRegError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (regData.password !== regData.confirmPassword) {
            setRegError('As senhas não coincidem.');
            return;
        }

        const existingUser = users.find(u => u.email.toLowerCase() === regData.email.toLowerCase());
        if (existingUser) {
            setRegError('Este e-mail já está cadastrado no sistema.');
            return;
        }

        setIsRegLoading(true);

        const newUser: User = {
            name: regData.name,
            email: regData.email,
            area: regData.area,
            role: 'Usuario',
            allowed: false,
            password: regData.password
        };

        setTimeout(() => {
            setIsRegLoading(false);
            setShowRegister(false);
            onRegister(newUser);
            alert('Solicitação de cadastro enviada! Um gestor precisa liberar seu acesso.');
            setRegData({ name: '', email: '', area: '', role: 'Usuario', password: '', confirmPassword: '' });
        }, 1500);
    };

    const handleForceChangeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setForceChangeError('');

        if (forceChangeData.newPassword.length < 6) {
            setForceChangeError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (forceChangeData.newPassword !== forceChangeData.confirmPassword) {
            setForceChangeError('As senhas não coincidem.');
            return;
        }

        if (forceChangeUser) {
            onForcePasswordChange(forceChangeUser.email, forceChangeData.newPassword);
            setShowForceChange(false);
            onLogin({ ...forceChangeUser, password: forceChangeData.newPassword, requiresPasswordChange: false });
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#C1E8FF] via-[#7DA0CA] to-[#052659] relative overflow-hidden font-sans">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#C1E8FF]/20 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#021024]/30 blur-[120px] rounded-full animate-pulse"></div>

            <div className="w-full max-w-md p-8 relative z-10 animate-slide-up">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-white rounded-3xl shadow-xl shadow-primary-blue/10 mb-6 group hover:scale-110 transition-transform duration-500">
                        <ShieldCheck className="text-primary-blue w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Gestor GN</h1>
                    <p className="text-slate-500 font-medium">Bem-vindo ao portal de negociações</p>
                </div>

                <div
                    className="bg-white/90 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/50 shadow-[0_50px_100px_-20px_rgba(2,16,36,0.3),0_30px_60px_-30px_rgba(0,0,0,0.3),inset_0_-2px_20px_rgba(0,0,0,0.05)] transform-gpu transition-all duration-700 hover:scale-[1.01]"
                    style={{
                        transform: 'perspective(1000px) rotateX(2deg)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.4) inset, 0 10px 20px -5px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-primary-blue transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl ring-0 focus:ring-2 focus:ring-primary-blue/20 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                                    placeholder="exemplo@grupo.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Senha</label>
                                <button
                                    type="button"
                                    onClick={() => setShowContactGestorModal(true)}
                                    className="text-[10px] font-bold text-primary-blue hover:text-deep-blue uppercase tracking-wider"
                                >
                                    Esqueceu?
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-primary-blue transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl ring-0 focus:ring-2 focus:ring-primary-blue/20 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary-blue hover:bg-deep-blue text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-blue/25 transition-all duration-300 flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-70 disabled:scale-100"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Entrar no Sistema
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                        <p className="text-slate-400 text-sm font-medium">
                            Não tem acesso? <button onClick={() => setShowRegister(true)} className="text-primary-blue font-bold hover:underline ml-1">Cadastre-se!</button>
                        </p>
                    </div>
                </div>

                <p className="text-center mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                    © 2026 Apoio • Versão Premium 1.0
                </p>
            </div>

            {/* Registration Modal */}
            {showRegister && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
                        <button
                            onClick={() => setShowRegister(false)}
                            className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 text-center border-b border-slate-100 bg-slate-50/50">
                            <div className="inline-flex p-3 bg-blue-100 text-primary-blue rounded-2xl mb-4">
                                <UserIcon size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Solicitar Acesso</h2>
                            <p className="text-sm text-slate-500">Preencha seus dados para criar sua conta</p>
                        </div>

                        <form onSubmit={handleRegister} className="p-8 space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
                                        <input
                                            required
                                            value={regData.name}
                                            onChange={e => setRegData({ ...regData, name: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-none ring-0 focus:ring-2 focus:ring-primary-blue/20 font-medium text-slate-700 placeholder-slate-300"
                                            placeholder="Seu nome"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mail Corporativo</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
                                        <input
                                            type="email"
                                            required
                                            value={regData.email}
                                            onChange={e => setRegData({ ...regData, email: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-none ring-0 focus:ring-2 focus:ring-primary-blue/20 font-medium text-slate-700 placeholder-slate-300"
                                            placeholder="seu.email@empresa.com"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Área / Depto</label>
                                        <div className="relative">
                                            <Building className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
                                            <input
                                                required
                                                value={regData.area}
                                                onChange={e => setRegData({ ...regData, area: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-none ring-0 focus:ring-2 focus:ring-primary-blue/20 font-medium text-slate-700 placeholder-slate-300"
                                                placeholder="Ex: Comercial"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cargo</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
                                            <input
                                                required
                                                value={regData.role}
                                                onChange={e => setRegData({ ...regData, role: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-none ring-0 focus:ring-2 focus:ring-primary-blue/20 font-medium text-slate-700 placeholder-slate-300"
                                                placeholder="Ex: Gerente"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Definir Senha</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
                                            <input
                                                type="password"
                                                required
                                                value={regData.password}
                                                onChange={e => setRegData({ ...regData, password: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-none ring-0 focus:ring-2 focus:ring-primary-blue/20 font-medium text-slate-700 placeholder-slate-300"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirmar Senha</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
                                            <input
                                                type="password"
                                                required
                                                value={regData.confirmPassword}
                                                onChange={e => setRegData({ ...regData, confirmPassword: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-none ring-0 focus:ring-2 focus:ring-primary-blue/20 font-medium text-slate-700 placeholder-slate-300"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {regError && (
                                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                        <AlertCircle size={14} />
                                        {regError}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isRegLoading}
                                className="w-full mt-6 py-4 bg-primary-blue text-white rounded-xl font-bold hover:bg-deep-blue shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {isRegLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirmar Cadastro'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Error Modal */}
            {errorModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative border border-white/20">
                        <div className="p-8 text-center bg-rose-50/50">
                            <div className="inline-flex p-4 bg-rose-100 text-rose-500 rounded-2xl mb-4 animate-bounce">
                                <Lock size={32} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Falha na Autenticação</h2>
                            <p className="text-sm text-slate-500 mt-2">{error}</p>
                        </div>

                        <div className="p-6 bg-white border-t border-slate-100">
                            <button
                                onClick={() => setErrorModalOpen(false)}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
                            >
                                Tentar Novamente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Gestor Modal */}
            {showContactGestorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative border border-white/20">
                        <button
                            onClick={() => setShowContactGestorModal(false)}
                            className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="p-8 text-center bg-slate-50/50">
                            <div className="inline-flex p-4 bg-blue-100 text-primary-blue rounded-2xl mb-4 animate-in zoom-in duration-500">
                                <Building size={32} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Esqueceu sua senha?</h2>
                            <p className="text-sm text-slate-500 mt-4 leading-relaxed">
                                Por questões de segurança, a redefinição de senha deve ser solicitada diretamente ao seu <strong>Gestor</strong> na tela de configurações de acesso.
                            </p>
                        </div>
                        <div className="p-6 bg-white border-t border-slate-100">
                            <button
                                onClick={() => setShowContactGestorModal(false)}
                                className="w-full py-4 bg-primary-blue text-white rounded-2xl font-bold hover:bg-deep-blue shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
                            >
                                Compreendi
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Force Password Change Modal */}
            {showForceChange && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative border border-white/20">
                        <div className="p-8 text-center bg-amber-50/50">
                            <div className="inline-flex p-4 bg-amber-100 text-amber-600 rounded-2xl mb-4 animate-bounce">
                                <Key size={32} />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Alteração Obrigatória</h2>
                            <p className="text-sm text-slate-500 mt-2">Você está usando uma senha temporária. Defina uma nova senha para continuar.</p>
                        </div>

                        <form onSubmit={handleForceChangeSubmit} className="p-8 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nova Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
                                    <input
                                        type="password"
                                        required
                                        value={forceChangeData.newPassword}
                                        onChange={e => setForceChangeData({ ...forceChangeData, newPassword: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-amber-500/20 font-medium text-slate-700"
                                        placeholder="Min. 6 caracteres"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirmar Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 text-slate-400 h-5 w-5" />
                                    <input
                                        type="password"
                                        required
                                        value={forceChangeData.confirmPassword}
                                        onChange={e => setForceChangeData({ ...forceChangeData, confirmPassword: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-amber-500/20 font-medium text-slate-700"
                                        placeholder="Repita a nova senha"
                                    />
                                </div>
                            </div>

                            {forceChangeError && (
                                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[10px] font-bold flex items-center gap-2">
                                    <AlertCircle size={14} />
                                    {forceChangeError}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full mt-4 py-4 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={18} />
                                Salvar e Entrar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
