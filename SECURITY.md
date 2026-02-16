# Auditoria de Segurança - Gestor GN

Este documento detalha as vulnerabilidades identificadas durante a análise de segurança e as ações tomadas para sua mitigação.

## 🚨 Resultados do Scan (16/02/2026)

| ID | Vulnerabilidade | Severidade | Status |
|----|-----------------|------------|--------|
| **V01** | Segredos Expostos no Frontend (AWS Secret Key) | **CRÍTICO** | ✅ CORRIGIDO |
| **V02** | Senhas em Texto Claro no Código | **CRÍTICO** | ✅ CORRIGIDO |
| **V03** | Ausência de Content Security Policy (CSP) | **ALTA** | ✅ CORRIGIDO |
| **V04** | Exposição de Referer Sensível | **MÉDIA** | ✅ CORRIGIDO |

---

## 🛠️ Detalhes e Remediação

### V01: Segredos Expostos no Frontend (Corrigido)
- **Local Original**: `services/s3.ts` e `.env`.
- **Descrição**: O uso de `VITE_AWS_SECRET_ACCESS_KEY` expunha a chave secreta da AWS no bundle JavaScript do navegador. 
- **Ação**: A infraestrutura de upload foi migrada de **AWS S3** para **Supabase Storage**.
  - O arquivo inseguro `services/s3.ts` foi removido.
  - Implementado `services/storage.ts` utilizando o cliente Supabase com Row Level Security (RLS).
  - Removidas as credenciais AWS do arquivo `.env`.
- **Resultado**: Eliminação total da exposição de chaves secretas no frontend para operações de arquivo.

### V02: Senhas em Texto Claro (Corrigido)
- **Local**: `constants.ts` (`INITIAL_USERS`).
- **Ação**: Removidas as senhas hardcoded. O sistema agora utiliza o Supabase Auth para gerenciar credenciais de forma segura.

### V03: Content Security Policy (Corrigido)
- **Local**: `index.html`.
- **Ação**: Adicionada meta tag CSP para restringir fontes de recursos, mitigando ataques de XSS e exfiltração de dados.

### V04: Referrer Policy (Corrigido)
- **Local**: `index.html`.
- **Ação**: Configurada a política `strict-origin-when-cross-origin` para proteger a privacidade dos caminhos de URL.

---

## 🛡️ Próximos Passos Sugeridos

1. **Rotação de Chaves AWS**: Como a chave `VITE_AWS_SECRET_ACCESS_KEY` foi exposta anteriormente, ela deve ser **invalidada e rotacionada** imediatamente no console da AWS IAM, mesmo que não seja mais usada pelo sistema.
2. **Configuração de RLS no Supabase**: Certifique-se de que o bucket `documents` no Supabase Storage tenha políticas de RLS ativas para garantir que usuários só acessem arquivos autorizados.
3. **HTTP Strict Transport Security (HSTS)**: Configurar no provedor de hospedagem (Vercel/Netlify) para forçar conexões HTTPS.

---
> **Nota**: Esta análise foi gerada e atualizada após a remediação das vulnerabilidades críticas de exposição de segredos.
