# ✅ Checklist de Deploy - Vercel

## Antes do Deploy

- [ ] Testar aplicação localmente (`npm run dev`)
- [ ] Executar build local com sucesso (`npm run build`)
- [ ] Testar preview da build (`npm run preview`)
- [ ] Verificar se todas as funcionalidades estão operacionais
- [ ] Confirmar que o arquivo `.env` NÃO está no Git
- [ ] Verificar se `.gitignore` está configurado corretamente

## Configuração Vercel

- [ ] Criar conta na Vercel
- [ ] Conectar repositório GitHub
- [ ] Configurar Framework: **Vite**
- [ ] Configurar Build Command: `npm run build`
- [ ] Configurar Output Directory: `dist`

## Variáveis de Ambiente

Adicionar no painel da Vercel (Settings > Environment Variables):

- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_AWS_ACCESS_KEY_ID`
- [ ] `VITE_AWS_SECRET_ACCESS_KEY`
- [ ] `VITE_AWS_REGION`
- [ ] `VITE_S3_BUCKET`

**Importante:** Marcar todos os ambientes (Production, Preview, Development)

## Configuração Supabase

- [ ] Projeto Supabase criado
- [ ] Tabela `negotiations` criada
- [ ] RLS (Row Level Security) configurado
- [ ] CORS configurado com domínio da Vercel

## Configuração AWS S3

- [ ] Bucket S3 criado
- [ ] Política de acesso configurada
- [ ] CORS configurado com domínio da Vercel
- [ ] Chaves de acesso (Access Key ID e Secret) geradas

## Deploy

- [ ] Fazer push para GitHub
- [ ] Verificar build automático na Vercel
- [ ] Aguardar conclusão do deploy
- [ ] Acessar URL gerada pela Vercel

## Pós-Deploy

- [ ] Testar todas as funcionalidades em produção
- [ ] Verificar upload de arquivos (S3)
- [ ] Verificar salvamento de dados (Supabase)
- [ ] Testar em diferentes navegadores
- [ ] Testar em dispositivos móveis
- [ ] Configurar domínio personalizado (opcional)
- [ ] Configurar analytics (opcional)

## Troubleshooting

Se algo não funcionar:

1. **Verificar logs da Vercel:**
   - Dashboard > Deployments > [seu deploy] > Runtime Logs

2. **Verificar variáveis de ambiente:**
   - Settings > Environment Variables
   - Confirmar que todas estão presentes
   - Fazer novo deploy após adicionar variáveis

3. **Verificar CORS:**
   - Supabase: Settings > API > CORS
   - AWS S3: Bucket > Permissions > CORS

4. **Build falha:**
   - Verificar erros no log de build
   - Testar build local
   - Verificar dependências no package.json

## Comandos Úteis

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login na Vercel
vercel login

# Deploy preview
vercel

# Deploy produção
vercel --prod

# Ver logs
vercel logs

# Listar deployments
vercel ls

# Ver variáveis de ambiente
vercel env ls
```

## Links Importantes

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://app.supabase.com
- **AWS Console:** https://console.aws.amazon.com

---

**Data:** ___/___/______
**Responsável:** _________________
**Status:** [ ] Pendente [ ] Em Progresso [ ] Concluído
