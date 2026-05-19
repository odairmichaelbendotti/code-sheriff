import { signIn } from "@/lib/auth-client";
import { useEffect, useRef, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { LuLoader } from "react-icons/lu";

const AUTH_STEPS = [
  { message: "Conectando ao GitHub", delay: 0 },
  { message: "Aguardando autorização", delay: 1500 },
  { message: "Verificando permissões", delay: 3500 },
  { message: "Configurando sua conta", delay: 5000 },
  { message: "Quase lá", delay: 8000 },
];

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "CodeSheriff — AI Code Review for Pull Requests";
  }, []);
  const [stepIndex, setStepIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  useEffect(() => {
    if (!isLoading) return;

    AUTH_STEPS.forEach((step, i) => {
      if (i === 0) return;
      const t = setTimeout(() => {
        setVisible(false);
        const fadeIn = setTimeout(() => {
          setStepIndex(i);
          setVisible(true);
        }, 300);
        timersRef.current.push(fadeIn);
      }, step.delay);
      timersRef.current.push(t);
    });

    return clearTimers;
  }, [isLoading]);

  function resetLoadingState() {
    clearTimers();
    setIsLoading(false);
    setStepIndex(0);
    setVisible(true);
  }

  async function handleGitHubLogin() {
    try {
      setIsLoading(true);
      await signIn.social({
        provider: "github",
        callbackURL: "http://localhost:5173/app/analyze",
        errorCallbackURL: "/",
      });
    } catch (error) {
      console.log(error);
      resetLoadingState();
    }
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
          disabled={isLoading}
          className="flex items-center justify-center w-full h-10.5 bg-[#1a1a1a] hover:bg-[#2d2d2d] active:bg-[#111] disabled:opacity-80 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium cursor-pointer transition-colors duration-150"
        >
          {isLoading ? (
            <LuLoader className="animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <FaGithub />
              Entrar com GitHub
            </div>
          )}
        </button>

        {isLoading && (
          <div className="mt-4 flex items-center justify-center gap-2 min-h-5">
            <span
              style={{
                opacity: visible ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
              className="text-[0.72rem] text-text-tertiary"
            >
              {AUTH_STEPS[stepIndex].message}
            </span>
          </div>
        )}

        {!isLoading && (
          <p className="mt-4 text-center text-[0.72rem] text-text-tertiary">
            Ao entrar, você concorda com os Termos de Uso
          </p>
        )}
      </div>
    </div>
  );
}
