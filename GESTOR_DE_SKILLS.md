# Guia de Skills - Gestor GN

Este documento descreve as funcionalidades e o propósito de cada "Skill" (habilidade) integrada ao ambiente de desenvolvimento do **Gestor GN**. As skills são pacotes de conhecimento especializado que orientam o comportamento da IA para garantir consistência, segurança e qualidade no projeto.

---

## 🛠️ Skills de Desenvolvimento e Infraestrutura

| Skill | Função / Descrição |
|-------|-------------------|
| **`api-patterns`** | Princípios de design de API. Orienta sobre REST, GraphQL, tRPC, formatos de resposta, versionamento e paginação. |
| **`app-builder`** | Orquestrador principal para construção de aplicações full-stack. Define o tipo de projeto e coordena outros agentes. |
| **`architecture`** | Estrutura para tomada de decisões arquiteturais. Análise de requisitos e documentação de decisões (ADR). |
| **`bash-linux`** | Padrões de terminal Linux/Bash. Comandos críticos, automação e tratamento de erros. |
| **`powershell-windows`** | Padrões de terminal Windows PowerShell. Sintaxe de operadores e melhores práticas locais. |
| **`nodejs-best-practices`** | Princípios de desenvolvimento Node.js. Seleção de frameworks, padrões assíncronos e segurança. |
| **`python-patterns`** | Princípios de desenvolvimento Python. Frameworks, tipos e estrutura de projeto. |
| **`rust-pro`** | Domínio avançado de Rust (1.75+), padrões assíncronos e sistemas de alta performance. |
| **`server-management`** | Gestão de servidores, monitoramento de processos e estratégias de escalonamento. |

---

## 🎨 Skills de Design e Frontend

| Skill | Função / Descrição |
|-------|-------------------|
| **`design_apoio`** | **(Global do Projeto)** Sistema de design exclusivo do Gestor GN. Contém a paleta de cores oficial, tipografia Inter e componentes Glassmorphism. |
| **`frontend-design`** | Princípios de UI/UX para web. Layouts, esquemas de cores e acessibilidade. |
| **`mobile-design`** | Design mobile-first para iOS e Android. Interações por toque e convenções de plataforma. |
| **`nextjs-react-expert`** | Otimização de performance para React e Next.js. Focado em redução de bundle e renderização eficiente. |
| **`tailwind-patterns`** | Princípios do Tailwind CSS v4. Configurações CSS-first e padrões modernos. |
| **`web-design-guidelines`** | Auditoria de interfaces contra melhores práticas de acessibilidade e usabilidade. |

---

## 🔒 Skills de Segurança e Qualidade

| Skill | Função / Descrição |
|-------|-------------------|
| **`clean-code`** | Padrões de código limpo, direto e sem sobre-engenharia. Focado em legibilidade. |
| **`vulnerability-scanner`** | Análise avançada de vulnerabilidades baseada no OWASP 2025 e segurança de supply chain. |
| **`red-team-tactics`** | Táticas de Red Team baseadas no MITRE ATT&CK para testes de intrusão e evasão. |
| **`code-review-checklist`** | Diretrizes para revisão de código cobrindo qualidade, segurança e lógica. |
| **`lint-and-validate`** | Regras de linting e validação estática de código para manter o padrão do repositório. |
| **`systematic-debugging`** | Metodologia de 4 fases para investigação profunda e correção de bugs complexos. |
| **`login_apoio`** | **(Global do Projeto)** Sistema de autenticação, registro e segurança de acesso. Gerencia fluxos de login e reset de senha. |

---

## 🧪 Skills de Teste e Localização

| Skill | Função / Descrição |
|-------|-------------------|
| **`testing-patterns`** | Padrões de testes unitários, integração e estratégias de mocking. |
| **`tdd-workflow`** | Ciclo RED-GREEN-REFACTOR para desenvolvimento guiado por testes. |
| **`webapp-testing`** | Testes de ponta a ponta (E2E) usando Playwright e auditorias profundas. |
| **`i18n-localization`** | Padrões de internacionalização e tradução para múltiplos idiomas. |

---

## 🧭 Skills de Gestão e Planejamento

| Skill | Função / Descrição |
|-------|-------------------|
| **`plan-writing`** | Estruturação de planos de tarefas com dependências claras e critérios de aceitação. |
| **`brainstorming`** | Protocolo de questionamento socrático para entender requisitos antes de codificar. |
| **`intelligent-routing`** | Seleção automática do melhor especialista (agente) para cada tarefa solicitada. |
| **`behavioral-modes`** | Adaptação do comportamento da IA (Brainstorm, Ship, Debug, Teach) conforme o contexto. |
| **`parallel-agents`** | Coordenação de múltiplos agentes para tarefas independentes e análises multidimensionais. |
| **`geo-fundamentals`** | Otimização para mecanismos de busca generativos (Generative Engine Optimization). |
| **`documentation-templates`** | Modelos para README, documentação de API e guia de usuário. |
| **`deployment-procedures`** | Princípios de deploy seguro, estratégias de rollback e verificação em produção. |

---

> **Dica**: Para ativar uma skill específica, você pode mencioná-la usando `@`. Por exemplo: "@design_apoio como aplico o azul principal neste botão?"
