"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../lib/auth";

const gradientPurple = "linear-gradient(135deg, #dd7fff, #7264ff)";

export default function ConnexionPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Identifiants incorrects. Veuillez réessayer.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#e0e7ff_0,_#f5f0ff_35%,_#020617_100%)] px-4 py-10">
      {/* Blobs d'arrière-plan */}
      <div className="pointer-events-none absolute -left-32 top-[-6rem] h-64 w-64 rounded-full bg-[#dd7fff]/40 blur-3xl opacity-70" />
      <div className="pointer-events-none absolute -right-24 bottom-[-4rem] h-64 w-64 rounded-full bg-[#54d4ef]/40 blur-3xl opacity-60" />

      {/* Container avec bandes LED animées */}
      <div className="led-container relative w-full max-w-md">
        {/* Popup de login */}
        <div className="relative w-full rounded-3xl bg-white/95 px-7 py-8 text-slate-900 shadow-[0_26px_70px_rgba(15,23,42,0.5)] ring-1 ring-white/60 backdrop-blur-xl animate-[fadeInUp_0.5s_ease-out] z-10">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl">
            <img
              src="/logo.png"
              alt="Call Tracking"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <p className="text-sm font-semibold">Call Tracking</p>
            <p className="text-[11px] text-slate-500">
              Connexion au dashboard d&apos;appels
            </p>
          </div>
        </div>
        <div className="mb-5 space-y-1 text-center">
          <h1 className="text-lg font-semibold">Bienvenue 👋</h1>
          <p className="text-xs text-slate-500">
            Entrez simplement votre email et mot de passe pour accéder à vos
            statistiques.
          </p>
        </div>

        {error && (
          <div className="mb-4 animate-[fadeIn_0.25s_ease-out] rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="text-xs font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="vous@entreprise.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#7264ff]/60 disabled:opacity-50"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="text-xs font-medium text-slate-700"
            >
              Mot de passe
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus-within:border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-[#7264ff]/60">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-5 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="ml-2 flex h-5 w-5 items-center justify-center text-slate-400 transition hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-slate-300 text-[#7264ff] focus:ring-0"
              />
              <span>Se souvenir de moi</span>
            </label>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-200 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
            style={{ background: gradientPurple }}
          >
            {isLoading ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 12px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        /* Animation des bandes LED circulaires */
        .led-container {
          padding: 4px;
          border-radius: 1.5rem;
          position: relative;
          overflow: hidden;
        }
        
        .led-container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 60deg,
            #54d4ef 80deg,
            #7264ff 100deg,
            #dd7fff 120deg,
            #7264ff 140deg,
            #54d4ef 160deg,
            transparent 180deg,
            transparent 360deg
          );
          animation: ledRotate 3s linear infinite;
          z-index: 0;
        }
        
        .led-container::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(
            from 180deg,
            transparent 0deg,
            transparent 60deg,
            #dd7fff 80deg,
            #7264ff 100deg,
            #54d4ef 120deg,
            #7264ff 140deg,
            #dd7fff 160deg,
            transparent 180deg,
            transparent 360deg
          );
          animation: ledRotateReverse 4s linear infinite;
          z-index: 0;
          opacity: 0.8;
        }
        
        @keyframes ledRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        @keyframes ledRotateReverse {
          0% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
