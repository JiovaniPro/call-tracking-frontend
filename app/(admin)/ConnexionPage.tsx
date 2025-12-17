"use client";

import { useState } from "react";
import { useAuth } from "../../lib/auth";

const gradientPurple = "linear-gradient(135deg, #dd7fff, #7264ff)";

export default function ConnexionPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          : "Identifiants incorrects. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f5f0ff] via-[#f6f9ff] to-[#f0fbff] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white/95 px-7 py-8 text-slate-900 shadow-[0_22px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold text-white shadow-md"
            style={{ background: gradientPurple }}
          >
            CT
          </div>
          <div>
            <p className="text-sm font-semibold">Call Tracking</p>
            <p className="text-[11px] text-slate-500">
              Connexion au dashboard d'appels
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
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#7264ff]/60 disabled:opacity-50"
            />
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
            className="mt-2 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
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
  );
}
