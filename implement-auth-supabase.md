# Task: Implementar Gestão de Usuários com Supabase (login_apoio)

Este plano detalha a migração do sistema de autenticação e gestão de usuários do `localStorage` para o **Supabase**, seguindo a skill `login_apoio`.

## 🛠️ Alterações Necessárias

### 1. Banco de Dados (Supabase SQL)
Criar ou atualizar a tabela `profiles` para suportar o fluxo customizado.
- [ ] Criar tabela/campos: `email` (PK), `name`, `password`, `role`, `area`, `allowed`, `requires_password_change`.
- [ ] Garantir que o RLS permita leitura apenas se autenticado (ou aberto para o fluxo de login customizado).

### 2. Frontend - Tipos e Constantes
- [ ] Validar `User` em `types.ts` (já parece correto).
- [ ] Ajustar `INITIAL_USERS` em `constants.ts` para servir apenas como seed inicial.

### 3. Frontend - Componentes (Views)
- [ ] **App.tsx**: 
    - [ ] Substituir `localStorage` por chamadas ao Supabase (`from('profiles')`).
    - [ ] Implementar lógica de "Seed" (se o banco estiver vazio, inserir `INITIAL_USERS`).
    - [ ] Sincronizar estado global `users` com o banco.
- [ ] **LoginView.tsx**:
    - [ ] Atualizar `handleRegister` para inserir no Supabase com `allowed: false`.
    - [ ] Validar login comparando com os dados vindos do banco.
- [ ] **ConfigurationView.tsx**:
    - [ ] Atualizar `onUpdateUser`, `onAddUser` e `onRemoveUser` para persistir no Supabase.
    - [ ] Implementar persistência do Reset de Senha.

## 🚀 Ordem de Execução

1. Executar SQL no Supabase.
2. Refatorar `App.tsx` (Core do estado de usuários).
3. Atualizar `LoginView.tsx` (Registro).
4. Atualizar `ConfigurationView.tsx` (Gestão administrativa).

## 🧪 Verificação (Checklist)
- [ ] Novo usuário consegue se registrar?
- [ ] Registro entra como `allowed: false`?
- [ ] Gestor consegue aprovar usuário?
- [ ] Usuário aprovado consegue logar?
- [ ] Reset de senha força a troca no primeiro login?
