import Link from "next/link";

const gradientPurple = "linear-gradient(135deg, #dd7fff, #7264ff)";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f5f0ff] via-[#f6f9ff] to-[#f0fbff] px-4 py-10 text-slate-900">
      <main className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 rounded-3xl bg-white/90 px-8 py-10 text-center shadow-[0_26px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:px-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-100">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: gradientPurple }}
          />
          Dashboard de suivi des appels & rendez-vous
        </span>
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Gardez le contrôle sur chaque{" "}
            <span
              className="bg-gradient-to-r from-[#dd7fff] via-[#7264ff] to-[#54d4ef] bg-clip-text text-transparent"
            >
              appel client
            </span>
            .
          </h1>
          <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
            Une vue simple et claire de vos appels du jour, rappels à traiter
            et performances globales.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
            style={{ background: gradientPurple }}
          >
            Se connecter
          </Link>
          <p className="text-xs text-slate-500">
            Accédez ensuite au dashboard complet de vos appels.
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-4 text-xs text-slate-500 sm:max-w-md">
          <div className="rounded-2xl bg-slate-50/90 p-3 ring-1 ring-slate-100">
            <p className="text-[11px] font-medium text-slate-600">
              Appels du jour
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">124</p>
            <p className="mt-1 text-[11px] text-emerald-500">+12% vs hier</p>
          </div>
          <div className="rounded-2xl bg-slate-50/90 p-3 ring-1 ring-slate-100">
            <p className="text-[11px] font-medium text-slate-600">
              Rappels à planifier
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">18</p>
            <p className="mt-1 text-[11px] text-slate-500">
              Ne perdez plus un prospect chaud.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
