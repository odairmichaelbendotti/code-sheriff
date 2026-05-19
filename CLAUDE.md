# CodeSheriff — Contexto do Projeto

## Comportamento esperado

- Nunca construa nada sem instrução explícita minha
- Quando eu pedir para implementar algo, pergunte se há dúvidas antes de escrever código
- Prefira soluções simples e diretas, sem over-engineering
- Sempre que criar um arquivo novo, me informe o caminho e o motivo
- Nunca crie um componente que não esteja listado na seção "Estrutura de componentes"
- Componentes globais reutilizáveis entre páginas ficam em `src/components/`

---

## O que é o projeto

CodeSheriff é uma aplicação web que utiliza inteligência artificial para analisar Pull Requests do GitHub de forma automática.

O desenvolvedor cola a URL de um PR, visualiza o diff dos arquivos alterados e dispara a análise. Um único agente de IA examina todos os arquivos de código em uma única chamada ao Claude, cobrindo três dimensões: segurança, performance e qualidade. Os resultados chegam em tempo real via SSE e são exibidos agrupados por arquivo, com severidade, snippet de código e sugestão de correção.

---

## Stack de tecnologias

- **Frontend:** React, React Router, Tailwind CSS v4, Zustand
- **Autenticação:** Better Auth + GitHub OAuth App
- **IA:** Anthropic SDK (`@anthropic-ai/sdk`) — modelo `claude-sonnet-4-6`
- **Integração GitHub:** Octokit (`@octokit/rest`)
- **Banco de dados:** Supabase (PostgreSQL) + Prisma ORM

---

## Estilização

- Sempre trabalhe com a interface mobile first
- Use Tailwind CSS v4 em todos os componentes, sem exceção, use a sintaxe mais recente
- Nunca use CSS puro ou CSS Modules (exceto `@keyframes` no `index.css` quando necessário)
- Cores customizadas são definidas via `@theme` no CSS global (`src/index.css`), não no `tailwind.config.ts`
- Use React Icons (`react-icons/lu`) para ícones

### Variáveis de cor (definidas no CSS global via `@theme`)

```css
@import "tailwindcss";

@theme {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f5f4ef;
  --color-bg-tertiary: #eeeee6;

  --color-text-primary: #1a1a19;
  --color-text-secondary: #6b6b66;
  --color-text-tertiary: #9b9b96;

  --color-border-subtle: rgba(0, 0, 0, 0.12);
  --color-border-default: rgba(0, 0, 0, 0.18);

  --color-accent: #d97757;
  --color-accent-hover: #c9664a;

  --radius-md: 8px;
  --radius-lg: 12px;
}

[data-theme="dark"] {
  --color-bg-primary: #1e1e1c;
  --color-bg-secondary: #2a2a27;
  --color-bg-tertiary: #323230;

  --color-text-primary: #ecece8;
  --color-text-secondary: #a8a8a3;
  --color-text-tertiary: #6b6b66;

  --color-border-subtle: rgba(255, 255, 255, 0.08);
  --color-border-default: rgba(255, 255, 255, 0.14);
}
```

Classes geradas automaticamente pelo Tailwind v4: `bg-bg-primary`, `text-text-secondary`, `border-border-subtle`, etc.

---

## Arquitetura e fluxo

1. Usuário acessa `/` — se autenticado redireciona para `/app/analyze`, senão vê a tela de login
2. Após login com GitHub via Better Auth, é redirecionado para `/app/analyze`
3. Better Auth armazena o `access_token` do GitHub no banco (tabela `account`)
4. Usuário cola a URL de um PR (ex: `https://github.com/user/repo/pull/42`) e clica em Analyze
5. Backend extrai `owner`, `repo` e `pull_number` da URL via `PrUrlParser`
6. Octokit busca os arquivos alterados via `pulls.listFiles` — retorna diff + metadata
7. Frontend redireciona para `/app/view` com os dados via `location.state` (store `usePrPreviewStore`)
8. Usuário visualiza o diff de cada arquivo (accordion) e clica em "Run AI Analysis"
9. Frontend navega para `/app/results/:owner/:repo/pull/:prNumber` passando `files` e `agents: ["unified"]` via `location.state`
10. Backend busca o conteúdo completo de cada arquivo de código via `repos.getContent` (ref = branch name)
11. Filtra apenas arquivos com extensões de código real (`.ts`, `.tsx`, `.js`, `.py`, etc.) — ignora `.md`, lockfiles, imagens, arquivos removidos
12. `unifiedAgent` monta um prompt com o diff de cada arquivo e faz **uma única chamada** ao Claude (`claude-sonnet-4-6`, `max_tokens: 8192`)
13. O prompt usa 2 fases: leitura silenciosa de todos os arquivos → relatório JSON
14. Findings são deduplicados por `file + agent + severity + line` e `file + agent + primeiras 10 palavras da mensagem`
15. Cada finding é emitido como evento SSE (`data: {...}\n\n`) conforme é processado
16. Frontend lê o stream via `fetch` + `ReadableStream` + `TextDecoder` + `getReader()`
17. Ao receber evento `done`, aguarda 4,5s mostrando o resumo, depois transiciona para a view de resultados
18. Resultados são exibidos agrupados por arquivo, filtráveis por agente (security/performance/quality)

---

## Estrutura de pastas

```
front-end/src/
├── components/
│   ├── AppLayout.tsx
│   ├── Navbar.tsx
│   ├── PrivateRoute.tsx
│   ├── PublicRoute.tsx
│   └── Stepper.tsx
├── pages/
│   ├── Login/
│   │   └── index.tsx
│   ├── Analyze/
│   │   ├── index.tsx
│   │   ├── PrInput.tsx
│   │   ├── AgentSelector.tsx      ← arquivo órfão, não usado
│   │   └── AnalysisHistory.tsx
│   ├── ViewCode/
│   │   ├── index.tsx
│   │   └── FileDiff.tsx
│   └── Results/
│       ├── index.tsx
│       ├── AnalysisStream.tsx
│       └── FindingCard.tsx
├── store/
│   ├── prPreview.store.ts
│   └── pulls.store.ts
├── lib/
│   └── auth-client.ts
├── utils/
│   └── defaultFetch.ts
├── router.tsx
├── main.tsx
└── index.css

back-end/src/
├── agents/
│   ├── unifiedAgent.ts            ← agente principal, única chamada ao Claude
│   ├── orchestrator.ts            ← chama unifiedAgent e emite SSE
│   ├── securityAgent.ts           ← contém os tipos Finding e FileContext
│   ├── performanceAgent.ts        ← órfão, não chamado
│   ├── qualityAgent.ts            ← órfão, não chamado
│   └── runAgent.ts                ← órfão, não chamado
├── controllers/
│   ├── analyze.controller.ts
│   └── user.controller.ts
├── routes/
│   ├── analyze.routes.ts
│   └── user.routes.ts
├── services/
│   ├── findAccountByUserId.ts
│   ├── getBranchName.ts
│   ├── getChangedFiles.ts
│   ├── getFileContent.ts
│   ├── getPullsByUser.ts
│   └── postPrReview.ts            ← órfão, funcionalidade removida
├── middleware/
│   └── authMiddleware.ts
├── lib/
│   ├── auth.ts
│   └── prisma.ts
└── utils/
    └── PrUrlParser.ts
```

---

## Estrutura de componentes

Cada página tem seus próprios componentes dentro da sua pasta. Componentes só existem se listados abaixo.

**Login** — sem componentes filhos, apenas a `index.tsx` com o botão de login GitHub

**Analyze** (`src/pages/Analyze/`)
- `index.tsx` — página principal com input de URL e histórico
- `PrInput.tsx` — campo para colar a URL do PR
- `AnalysisHistory.tsx` — lista de análises anteriores do usuário

**ViewCode** (`src/pages/ViewCode/`)
- `index.tsx` — exibe o diff do PR e botão "Run AI Analysis". Dados vêm do `usePrPreviewStore`. Tem botões "Expand all" / "Collapse all".
- `FileDiff.tsx` — accordion de um único arquivo: header clicável com filename, status, adições/deleções e diff colorido. Aceita prop `forceOpen?: boolean | null` para expand/collapse global.

**Results** (`src/pages/Results/`)
- `index.tsx` — controla o SSE, estado de streaming e a view (stream → results)
- `AnalysisStream.tsx` — terminal animado durante a análise; estado de conclusão com verdict + cards por agente + countdown
- `FindingCard.tsx` — card de um finding com snippet de código, sugestão e diff colorido

**Componentes globais** (`src/components/`)
- `Stepper.tsx` — indicador de progresso das 3 etapas (Select PR → Review changes → AI Analysis). Recebe `current` (0, 1 ou 2).
- `AppLayout.tsx`, `Navbar.tsx`, `PrivateRoute.tsx`, `PublicRoute.tsx`

---

## Rotas (React Router)

```tsx
<Routes>
  <Route path="/" element={<PublicRoute />} />

  <Route element={<PrivateRoute />}>
    <Route element={<AppLayout />}>
      <Route path="/app/analyze" element={<Analyze />} />
      <Route path="/app/view" element={<ViewCode />} />
      <Route path="/app/results/:owner/:repo/pull/:prNumber" element={<Results />} />
    </Route>
  </Route>
</Routes>
```

---

## Agente de IA — decisões importantes

- **Uma única chamada ao Claude** por análise, independente do número de arquivos
- Apenas arquivos com extensões de código são enviados: `.ts .tsx .js .jsx .mjs .cjs .py .go .rs .java .kt .swift .c .cpp .h .cs .php .rb .vue .svelte .sql .sh .yaml .yml .json .env .toml`
- Arquivos com `status: "removed"` são ignorados
- O prompt envia apenas o **diff** de cada arquivo (não o conteúdo completo), o que mantém o input em ~8–15k tokens para PRs normais
- O conteúdo completo do arquivo é buscado mas usado apenas localmente para gerar `code_snippet` (as linhas em destaque no card), nunca vai para o prompt
- Deduplicação dupla: por `file + agent + severity + line exata` e por `file + agent + primeiras 10 palavras da mensagem`
- Retry automático em caso de 429 (rate limit): aguarda 12s e tenta novamente
- `max_tokens: 8192` para comportar respostas com muitos findings

### Tipos principais (definidos em `securityAgent.ts`)

```typescript
type Finding = {
  agent: "security" | "performance" | "quality";
  file: string;
  line: number;
  severity: "critical" | "warning" | "suggestion";
  message: string;
  suggestion: string;
  code_snippet: { line: number; code: string; highlight: boolean }[];
  code_fix: { type: "removed" | "added" | "context"; code: string }[];
};

type FileContext = {
  filename: string;
  content: string;
  patch: string | undefined;
};
```

---

## SSE — protocolo de streaming

O backend emite eventos no formato `data: {...}\n\n`. Eventos possíveis:

```
{ type: "agent_start", agent: "unified" }
{ type: "finding", data: Finding }
{ type: "agent_done", agent: "unified" }
{ type: "done" }
```

O frontend lê via `fetch` + `res.body.getReader()` + `TextDecoder`. O `useEffect` que inicia o fetch usa `fetchStarted = useRef(false)` para evitar dupla execução no React StrictMode.

---

## Autenticação

- Provedor: GitHub OAuth App
- Escopos configurados: `read:user`, `user:email`, `repo`
- O `access_token` do GitHub fica salvo pelo Better Auth na tabela `account`
- Para usar o token no backend: `findAccountByUserId(req.session.userId)`
- O token é passado diretamente para o Octokit: `new Octokit({ auth: accessToken })`

---

## Banco de dados

- Plataforma: Supabase (PostgreSQL gerenciado)
- ORM: Prisma
- Tabelas gerenciadas pelo Better Auth: `user`, `session`, `account`
- Tabelas do projeto: `analyses` (histórico de análises por usuário)

---

## Chamadas principais do Octokit

```ts
// Busca arquivos alterados no PR
octokit.rest.pulls.listFiles({ owner, repo, pull_number })

// Busca o nome da branch (usado como ref para getContent)
octokit.rest.pulls.get({ owner, repo, pull_number }) // → data.head.ref

// Busca conteúdo completo de um arquivo na branch do PR
octokit.rest.repos.getContent({ owner, repo, path, ref: branchName })
```

---

## Variáveis de ambiente

**Frontend (`.env`):**
```env
VITE_SERVER_URL=http://localhost:3000
```

**Backend (`.env`):**
```env
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=sua_chave_secreta
GITHUB_CLIENT_ID=seu_client_id
GITHUB_CLIENT_SECRET=seu_client_secret
DATABASE_URL=sua_url_do_supabase
ANTHROPIC_API_KEY=sua_chave_anthropic
```

---

## Convenções do projeto

- TypeScript em todo o projeto
- Nenhuma lógica de IA no frontend — tudo no servidor
- Streaming via SSE nativo (Express `res.write` + `res.flushHeaders`), sem Vercel AI SDK
- Respostas do agente sempre em JSON puro, nunca texto livre
- Rotas do backend sempre sob `/api`
- Rotas do frontend não usam `/api` — são gerenciadas pelo React Router
- Zustand para estado global (`usePrPreviewStore`, `usePullsStore`)
