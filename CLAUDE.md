# CodeSheriff — Contexto do Projeto

## Comportamento esperado

- Nunca construa nada sem instrução explícita minha
- Quando eu pedir para implementar algo, pergunte se há dúvidas antes de escrever código
- Prefira soluções simples e diretas, sem over-engineering
- Sempre que criar um arquivo novo, me informe o caminho e o motivo
- Nunca crie um componente que não esteja listado na seção "Estrutura de componentes"
- Nunca crie uma pasta `/components` global

---

## O que é o projeto

CodeSheriff é uma aplicação web que utiliza inteligência artificial para analisar Pull Requests do GitHub de forma automática e eficiente.

O desenvolvedor cola a URL de um PR e três agentes especializados examinam o código em paralelo — cada um focado em uma dimensão crítica: segurança, performance e qualidade. Ao final da análise, o desenvolvedor recebe um relatório detalhado com os problemas encontrados, a localização exata no código e sugestões concretas de correção.

Os comentários são postados diretamente nas linhas do PR dentro do GitHub, no mesmo formato de um code review feito por um colega de time.

---

## Stack de tecnologias

- **Frontend:** React, React Router, Tailwind CSS
- **Autenticação:** Better Auth + GitHub OAuth App
- **IA:** LangChain.js, OpenAI GPT-4o, Vercel AI SDK (streaming)
- **Integração GitHub:** Octokit (`@octokit/rest`)
- **Banco de dados:** Supabase (PostgreSQL) + Drizzle ORM

---

## Estilização

- Sempre trabalhe com a interface mobile first
- Use Tailwind CSS 4.3 em todos os componentes, sem exceção, use a sintaxe mais recente
- Nunca use CSS puro ou CSS Modules
- Cores customizadas ficam no `tailwind.config.ts`, não em variáveis CSS
- Use React Icons para ícones

## Arquitetura e fluxo

1. Usuário acessa a aplicação e faz login com GitHub via Better Auth
2. Better Auth armazena o `access_token` do GitHub no banco (tabela `account`)
3. Usuário cola a URL de um PR (ex: `https://github.com/user/repo/pull/42`)
4. O backend extrai `owner`, `repo` e `pull_number` da URL
5. O backend busca o `access_token` do usuário no banco e instancia o Octokit com ele
6. Octokit busca os arquivos alterados no PR via `pulls.listFiles`
7. O orquestrador LangChain divide o diff por arquivo e dispara 3 agentes em paralelo:
   - **Agente Segurança** — SQL injection, secrets vazados, vulnerabilidades OWASP
   - **Agente Performance** — N+1 queries, loops desnecessários, uso de memória
   - **Agente Qualidade** — boas práticas, DRY, naming, tipagem
8. Cada agente retorna JSON estruturado: `{ linha, severidade, mensagem, sugestão }`
9. O agregador junta os resultados, remove duplicatas e ordena por severidade
10. Os resultados são enviados ao browser via SSE (streaming em tempo real)
11. O Octokit posta o review com comentários nas linhas exatas do PR via `pulls.createReview`

---

## Estrutura de pastas

```
src/
├── pages/
│   ├── Login/
│   │   └── index.tsx
│   ├── Home/
│   │   ├── index.tsx
│   │   ├── PrInput.tsx
│   │   ├── AgentSelector.tsx
│   │   └── AnalysisHistory.tsx
│   └── Results/
│       ├── index.tsx
│       ├── StreamLog.tsx
│       ├── FindingCard.tsx
│       └── SeverityStats.tsx
├── router.tsx
├── main.tsx
└── ...
server/
├── index.ts
├── routes/
│   ├── auth.ts
│   └── analyze.ts
├── agents/
│   ├── securityAgent.ts
│   ├── performanceAgent.ts
│   └── qualityAgent.ts
├── lib/
│   ├── octokit.ts
│   ├── langchain.ts
│   └── db.ts
└── ...
```

---

## Estrutura de componentes

Cada página tem seus próprios componentes dentro da sua pasta. Componentes só existem se listados abaixo.

**Login** — sem componentes filhos, apenas a `index.tsx` com o botão de login GitHub

**Home** (`src/pages/Home/`)

- `index.tsx` — página principal, compõe os componentes abaixo
- `PrInput.tsx` — campo para colar a URL do PR e botão de análise
- `AgentSelector.tsx` — checkboxes para ativar/desativar cada agente
- `SeverityStats.tsx` — lista de análises anteriores do usuário

**Results** (`src/pages/Results/`)

- `index.tsx` — página de resultados, compõe os componentes abaixo
- `StreamLog.tsx` — exibe o raciocínio dos agentes em tempo real via SSE
- `FindingCard.tsx` — card de um único finding (severidade, arquivo, linha, sugestão)
- `AnalysisHistory.tsx` — contadores de críticos, avisos e sugestões

---

## Rotas (React Router)

```tsx
<Routes>
  <Route path="/" element={<Login />} />
  <Route path="/app" element={<PrivateRoute />}>
    <Route index element={<Home />} />
    <Route path="analyze/:id" element={<Results />} />
  </Route>
</Routes>
```

---

## Autenticação

- Provedor: GitHub OAuth App
- Escopos necessários: `repo`, `user`
- O `access_token` do GitHub fica salvo pelo Better Auth na tabela `account`
- Para usar o token no backend: buscar via `db.query` filtrando por `session.user.id`
- O token é passado diretamente para o Octokit: `new Octokit({ auth: githubToken })`

---

## Banco de dados

- Plataforma: Supabase (PostgreSQL gerenciado)
- ORM: Drizzle
- Tabelas gerenciadas pelo Better Auth: `user`, `session`, `account`
- Tabelas do projeto: `analyses` (histórico de análises por usuário)

---

## Chamadas principais do Octokit

```ts
// Busca arquivos alterados no PR
octokit.pulls.listFiles({ owner, repo, pull_number });

// Busca conteúdo original de um arquivo para contexto
octokit.repos.getContent({ owner, repo, path, ref });

// Posta o review com comentários nas linhas
octokit.pulls.createReview({
  owner,
  repo,
  pull_number,
  event: "COMMENT",
  comments,
});
```

---

## Convenções do projeto

- TypeScript em todo o projeto
- Variáveis de ambiente no `.env` (backend) e `.env.local` (frontend)
- Nenhuma lógica de IA no frontend — tudo no servidor
- Streaming via SSE usando o Vercel AI SDK (`streamText`)
- Respostas dos agentes sempre em JSON estruturado, nunca texto livre
