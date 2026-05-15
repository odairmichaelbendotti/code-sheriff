export default function Login() {
  function handleGitHubLogin() {
    // TODO: signIn.social({ provider: "github" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
      <div className="w-full max-w-95 bg-bg-primary border-[0.5px] border-border-subtle rounded-lg p-8 shadow-[0_2px_8px_rgba(0,0,0,0.05),0_8px_32px_rgba(0,0,0,0.07)]">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-[1.375rem] font-bold tracking-[-0.02em] text-text-primary">
              CodeSheriff
            </span>
          </div>
          <p className="text-[0.8125rem] leading-relaxed text-text-tertiary">
            Análise automática de Pull Requests com IA
          </p>
        </div>

        <hr className="border-border-subtle mb-6" />

        <button
          onClick={handleGitHubLogin}
          className="flex items-center justify-center gap-2.5 w-full h-[42px] bg-[#1a1a1a] hover:bg-[#2d2d2d] active:bg-[#111] text-white rounded-md text-sm font-medium cursor-pointer transition-colors duration-150"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Entrar com GitHub
        </button>

        <p className="mt-4 text-center text-[0.72rem] text-text-tertiary">
          Ao entrar, você concorda com os Termos de Uso
        </p>
      </div>
    </div>
  );
}
