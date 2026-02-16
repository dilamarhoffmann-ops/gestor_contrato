# 🚀 Guia de Deploy na Vercel

## Visão Geral

Este guia detalha o processo completo de deploy do **Gestor de Negociação de Postos** na Vercel.

## ✅ Pré-requisitos

- [ ] Conta na Vercel (gratuita ou paga)
- [ ] Conta no Supabase configurada
- [ ] Conta AWS com bucket S3 criado
- [ ] Git instalado
- [ ] Node.js 18+ instalado

## 📋 Checklist Antes do Deploy

### 1. Verificar Variáveis de Ambiente

Certifique-se de ter todas as variáveis necessárias:

```bash
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_AWS_ACCESS_KEY_ID
VITE_AWS_SECRET_ACCESS_KEY
VITE_AWS_REGION
VITE_S3_BUCKET
```

### 2. Testar Build Local

```bash
npm run build
```

Se o build falhar, corrija os erros antes de continuar.

### 3. Testar Preview Local

```bash
npm run preview
```

Acesse `http://localhost:4173` e teste a aplicação.

## 🎯 Métodos de Deploy

### Método 1: Deploy via GitHub (Recomendado)

#### Passo 1: Criar Repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique em "New repository"
3. Nome: `gestor-contratos` (ou outro de sua preferência)
4. Visibilidade: Private (recomendado para projetos com dados sensíveis)
5. Clique em "Create repository"

#### Passo 2: Fazer Push do Código

```bash
# Inicializar Git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Initial commit - Gestor de Negociação"

# Renomear branch para main
git branch -M main

# Adicionar remote
git remote add origin https://github.com/SEU-USUARIO/gestor-contratos.git

# Fazer push
git push -u origin main
```

#### Passo 3: Conectar à Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "Add New..." > "Project"
4. Selecione seu repositório `gestor-contratos`
5. Clique em "Import"

#### Passo 4: Configurar Projeto na Vercel

**Framework Preset:** Vite
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

#### Passo 5: Adicionar Variáveis de Ambiente

1. Na tela de configuração, clique em "Environment Variables"
2. Adicione cada variável:

```
VITE_SUPABASE_URL = https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY = sua_chave_aqui
VITE_AWS_ACCESS_KEY_ID = sua_key_aqui
VITE_AWS_SECRET_ACCESS_KEY = sua_secret_aqui
VITE_AWS_REGION = sa-east-1
VITE_S3_BUCKET = seu-bucket
```

3. Para cada variável, marque os ambientes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

#### Passo 6: Deploy

1. Clique em "Deploy"
2. Aguarde o build (geralmente 1-3 minutos)
3. Acesse a URL gerada pela Vercel

### Método 2: Deploy via CLI da Vercel

#### Passo 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

#### Passo 2: Login

```bash
vercel login
```

Siga as instruções para autenticar via email ou GitHub.

#### Passo 3: Deploy

**Para Preview:**
```bash
vercel
```

**Para Produção:**
```bash
vercel --prod
```

#### Passo 4: Configurar Variáveis via CLI

```bash
vercel env add VITE_SUPABASE_URL
# Cole o valor quando solicitado
# Selecione os ambientes (Production, Preview, Development)

# Repita para cada variável
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_AWS_ACCESS_KEY_ID
vercel env add VITE_AWS_SECRET_ACCESS_KEY
vercel env add VITE_AWS_REGION
vercel env add VITE_S3_BUCKET
```

### Método 3: Deploy Automatizado (Script)

#### Windows:
```bash
deploy.bat
```

#### Linux/Mac:
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🔧 Configurações Avançadas

### Custom Domain

1. Acesse seu projeto na Vercel
2. Vá em "Settings" > "Domains"
3. Adicione seu domínio personalizado
4. Configure os DNS conforme instruções

### Configurar CORS no Supabase

Se tiver problemas de CORS:

1. Acesse o Supabase Dashboard
2. Vá em "Settings" > "API"
3. Em "CORS Allowed Origins", adicione:
   - `https://seu-dominio.vercel.app`
   - `http://localhost:5173` (para desenvolvimento)

### Configurar CORS no S3

1. Acesse o AWS S3 Console
2. Selecione seu bucket
3. Vá em "Permissions" > "CORS configuration"
4. Adicione:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": [
            "https://seu-dominio.vercel.app",
            "http://localhost:5173"
        ],
        "ExposeHeaders": []
    }
]
```

## 🐛 Troubleshooting

### Build Falha

**Erro:** `Module not found`
**Solução:** 
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Variáveis de Ambiente Não Funcionam

**Problema:** Variáveis não são reconhecidas em produção
**Solução:**
1. Verifique se todas começam com `VITE_`
2. Reconfigure na Vercel Dashboard
3. Faça um novo deploy

### Erro 404 em Rotas

**Problema:** Páginas retornam 404 ao recarregar
**Solução:** O arquivo `vercel.json` já está configurado com rewrites. Certifique-se de que ele existe.

### Erro de CORS

**Problema:** Requisições bloqueadas por CORS
**Solução:**
1. Configure CORS no Supabase
2. Configure CORS no S3
3. Adicione o domínio da Vercel às origens permitidas

## 📊 Monitoramento

### Analytics

A Vercel oferece analytics integrado:
1. Acesse seu projeto
2. Vá em "Analytics"
3. Visualize métricas de performance e uso

### Logs

Para ver logs em tempo real:
```bash
vercel logs
```

Ou acesse via Dashboard:
1. Projeto > "Deployments"
2. Clique no deployment
3. Vá em "Runtime Logs"

## 🔄 Atualizações

### Deploy Automático (GitHub)

Após conectar à Vercel via GitHub:
- Cada push na branch `main` → Deploy em produção
- Cada push em outras branches → Deploy de preview

### Deploy Manual

```bash
# Fazer alterações
git add .
git commit -m "Descrição das mudanças"
git push

# Ou via CLI
vercel --prod
```

## 🔒 Segurança

### Boas Práticas

1. ✅ Nunca commite arquivos `.env`
2. ✅ Use variáveis de ambiente para dados sensíveis
3. ✅ Mantenha o repositório privado
4. ✅ Revise as permissões do IAM da AWS
5. ✅ Use RLS (Row Level Security) no Supabase
6. ✅ Ative 2FA na Vercel e GitHub

### Rotação de Credenciais

Periodicamente, atualize:
1. Chaves AWS
2. Tokens do Supabase
3. Senhas de banco de dados

## 📞 Suporte

- **Vercel Docs:** https://vercel.com/docs
- **Vite Docs:** https://vitejs.dev
- **Supabase Docs:** https://supabase.com/docs

## ✨ Próximos Passos

Após o deploy bem-sucedido:

1. [ ] Configurar domínio personalizado
2. [ ] Configurar analytics
3. [ ] Configurar alertas de erro
4. [ ] Implementar CI/CD avançado
5. [ ] Configurar backups automáticos do Supabase
6. [ ] Implementar testes automatizados
7. [ ] Configurar monitoramento de performance

---

**Última atualização:** 2026-02-13
