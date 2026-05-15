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

- **Frontend:** React, React Router, Tailwind CSS v4
- **Autenticação:** Better Auth + GitHub OAuth App
- **IA:** LangChain.js, OpenAI GPT-4o, Vercel AI SDK (streaming)
- **Integração GitHub:** Octokit (`@octokit/rest`)
- **Banco de dados:** Supabase (PostgreSQL) + Prisma ORM

---

## Estilização

- Sempre trabalhe com a interface mobile first
- Use Tailwind CSS v4 em todos os componentes, sem exceção, use a sintaxe mais recente
- Nunca use CSS puro ou CSS Modules
- Cores customizadas são definidas via `@theme` no CSS global, não no `tailwind.config.ts`
- Use React Icons para ícones

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

1. Usuário acessa `/` — se já autenticado é redirecionado para `/analyze`, senão vê a tela de login
2. Após login com GitHub via Better Auth, é redirecionado para `/analyze`
3. Better Auth armazena o `access_token` do GitHub no banco (tabela `account`)
4. Usuário cola a URL de um PR (ex: `https://github.com/user/repo/pull/42`)
5. O backend extrai `owner`, `repo` e `pull_number` da URL
6. O backend busca o `access_token` do usuário no banco e instancia o Octokit com ele
7. Octokit busca os arquivos alterados no PR via `pulls.listFiles`
8. O orquestrador LangChain divide o diff por arquivo e dispara 3 agentes em paralelo:
   - **Agente Segurança** — SQL injection, secrets vazados, vulnerabilidades OWASP
   - **Agente Performance** — N+1 queries, loops desnecessários, uso de memória
   - **Agente Qualidade** — boas práticas, DRY, naming, tipagem
9. Cada agente retorna JSON estruturado: `{ linha, severidade, mensagem, sugestão }`
10. O agregador junta os resultados, remove duplicatas e ordena por severidade
11. Os resultados são enviados ao browser via SSE (streaming em tempo real)
12. O Octokit posta o review com comentários nas linhas exatas do PR via `pulls.createReview`

---

## Estrutura de pastas

```
src/
├── pages/
│   ├── Login/
│   │   └── index.tsx
│   ├── Analyze/
│   │   ├── index.tsx
│   │   ├── PrInput.tsx
│   │   ├── AgentSelector.tsx
│   │   └── AnalysisHistory.tsx
│   └── Results/
│       ├── index.tsx
│       ├── StreamLog.tsx
│       ├── FindingCard.tsx
│       └── SeverityStats.tsx
├── lib/
│   └── auth-client.ts
├── router.tsx
├── main.tsx
└── index.css
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

**Analyze** (`src/pages/Analyze/`)

- `index.tsx` — página principal, compõe os componentes abaixo
- `PrInput.tsx` — campo para colar a URL do PR e botão de análise
- `AgentSelector.tsx` — checkboxes para ativar/desativar cada agente
- `AnalysisHistory.tsx` — lista de análises anteriores do usuário

**Results** (`src/pages/Results/`)

- `index.tsx` — página de resultados, compõe os componentes abaixo
- `StreamLog.tsx` — exibe o raciocínio dos agentes em tempo real via SSE
- `FindingCard.tsx` — card de um único finding (severidade, arquivo, linha, sugestão)
- `SeverityStats.tsx` — contadores de críticos, avisos e sugestões

---

## Rotas (React Router)

```tsx
<Routes>
  <Route path="/" element={<PublicRoute />} />

  <Route element={<PrivateRoute />}>
    <Route element={<AppLayout />}>
      <Route path="/analyze" element={<Analyze />} />
      <Route path="/results/:id" element={<Results />} />
    </Route>
  </Route>
</Routes>
```

**PublicRoute** — se autenticado redireciona para `/analyze`, senão renderiza `<Login />`

**PrivateRoute** — se não autenticado redireciona para `/`, senão renderiza `<Outlet />`

**Redirecionamento após login:**

```typescript
await signIn.social({
  provider: "github",
  callbackURL: "/analyze",
});
```

---

## Autenticação

- Provedor: GitHub OAuth App
- Escopos necessários: `repo`, `user`
- O `access_token` do GitHub fica salvo pelo Better Auth na tabela `account`
- Para usar o token no backend: buscar via `db.query` filtrando por `session.user.id`
- O token é passado diretamente para o Octokit: `new Octokit({ auth: githubToken })`
- Cliente Better Auth fica em `src/lib/auth-client.ts`

```typescript
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL,
});

export const { signIn, signOut, useSession } = authClient;
```

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

## Variáveis de ambiente

**Frontend (`.env.local`):**

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
```

---

## Convenções do projeto

- TypeScript em todo o projeto
- Nenhuma lógica de IA no frontend — tudo no servidor
- Streaming via SSE usando o Vercel AI SDK (`streamText`)
- Respostas dos agentes sempre em JSON estruturado, nunca texto livre
- Rotas do backend sempre sob `/api`
- Rotas do frontend não usam `/api` — são gerenciadas pelo React Router
