# Gestor de Negociação de Postos

Sistema de gestão de negociações para postos de combustível.

**URL de Produção:** [https://gestor-contratos-apoio.vercel.app](https://gestor-contratos-apoio.vercel.app)

## 🚀 Deploy na Vercel

### Pré-requisitos
- Conta na Vercel
- Conta no Supabase
- Conta AWS S3 (para upload de documentos)

### Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no painel da Vercel:

```bash
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
VITE_AWS_ACCESS_KEY_ID=sua_access_key_aws
VITE_AWS_SECRET_ACCESS_KEY=sua_secret_key_aws
VITE_AWS_REGION=sa-east-1
VITE_S3_BUCKET=nome_do_seu_bucket
```

### Passos para Deploy

#### Opção 1: Deploy via CLI da Vercel

1. Instale a CLI da Vercel:
```bash
npm install -g vercel
```

2. Faça login na Vercel:
```bash
vercel login
```

3. Deploy do projeto:
```bash
vercel
```

4. Para deploy em produção:
```bash
vercel --prod
```

#### Opção 2: Deploy via GitHub (Recomendado)

1. Crie um repositório no GitHub
2. Faça push do código:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/seu-repositorio.git
git push -u origin main
```

3. Acesse [vercel.com](https://vercel.com)
4. Clique em "Add New Project"
5. Importe seu repositório do GitHub
6. Configure as variáveis de ambiente
7. Clique em "Deploy"

### Configuração das Variáveis de Ambiente na Vercel

1. Acesse seu projeto na Vercel
2. Vá em "Settings" > "Environment Variables"
3. Adicione cada variável:
   - Nome: `VITE_SUPABASE_URL`
   - Valor: Sua URL do Supabase
   - Ambiente: Production, Preview, Development (marque todos)
4. Repita para todas as variáveis
5. Faça um novo deploy para aplicar as mudanças

### ⚠️ Segurança

**IMPORTANTE**: Nunca commite o arquivo `.env` para o repositório. Ele já está no `.gitignore`.

As variáveis de ambiente devem ser configuradas diretamente no painel da Vercel.

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm preview
```

## 📦 Tecnologias

- React 19
- TypeScript
- Vite
- Supabase
- AWS S3
- Lucide Icons
- Tailwind CSS

## 📝 Estrutura do Projeto

```
gestor_contratos/
├── components/        # Componentes reutilizáveis
├── services/         # Serviços (Supabase, AWS S3)
├── views/            # Páginas/Views principais
├── types.ts          # Definições de tipos TypeScript
├── constants.ts      # Constantes e configurações
├── App.tsx           # Componente principal
└── index.tsx         # Entry point
```

## 🔧 Configuração do Supabase

Certifique-se de ter as seguintes tabelas criadas no Supabase:

- `negotiations` - Armazena os dados das negociações
- `users` - Gerenciamento de usuários (se aplicável)

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
