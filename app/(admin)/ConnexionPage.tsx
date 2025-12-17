import Link from "next/link";

const gradientPurple = "linear-gradient(135deg, #dd7fff, #7264ff)";
const gradientBorder = "linear-gradient(135deg, #dd7fff, #54d4ef)";

export default function ConnexionPage() {
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
              Connexion au dashboard d’appels
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
        <form className="space-y-4">
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#7264ff]/60"
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#7264ff]/60"
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
            <span>Aucune authentification réelle (démo).</span>
          </div>
          <Link
            href="/dashboard"
            className="mt-2 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
            style={{ background: gradientPurple }}
          >
            Se connecter
          </Link>
        </form>
      </div>
    </div>
  );
}

