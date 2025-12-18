"use client";

import Link from "next/link";

const gradientPrimary = "linear-gradient(135deg, #dd7fff, #7264ff)";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#e0e7ff_0,_#f5f0ff_35%,_#020617_100%)] text-slate-900">
      {/* Blobs animés en arrière-plan */}
      <div className="pointer-events-none absolute -left-40 top-[-6rem] h-72 w-72 rounded-full bg-[#dd7fff]/40 blur-3xl opacity-70 animate-[float_16s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -right-32 top-40 h-72 w-72 rounded-full bg-[#54d4ef]/40 blur-3xl opacity-60 animate-[float_18s_ease-in-out_infinite_reverse]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[-10rem] h-80 bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.75)_0,_transparent_60%)]" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-12 pt-8 sm:px-8">
        {/* Top bar */}
        <header className="card-slide-top mb-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl">
              <img
                src="/logo.png"
                alt="Call Tracking"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Call Tracking
              </p>
              <p className="text-[11px] font-medium text-slate-500">
                CRM d&apos;appels & rappels
              </p>
            </div>
        </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-medium text-slate-900 shadow-sm shadow-white/40 ring-1 ring-white/60 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/40"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Déjà un compte ?{" "}
            <span className="text-[#6a2cff]">Se connecter</span>
          </Link>
        </header>

        {/* Hero */}
        <section className="grid flex-1 grid-cols-1 items-center gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          {/* Colonne gauche : texte + CTA */}
          <div className="space-y-6">
            <div className="card-slide-top-delayed inline-flex items-center gap-2 rounded-full bg-white/30 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm ring-1 ring-white/60 backdrop-blur">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: gradientPrimary }}
              />
              Pilotage temps réel des appels & rappels
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                <span className=" bg-gradient-to-r from-[#dd7fff] via-[#7264ff] to-[#54d4ef] bg-clip-text text-transparent">
                  Transformez chaque
                </span>
                <br />
                <span className=" typewriter bg-gradient-to-r from-[#dd7fff] via-[#7264ff] to-[#54d4ef] bg-clip-text text-transparent">
                  appel en opportunité.
                </span>
              </h1>
              <p className=" max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Visualisez vos appels du jour, vos rappels urgents et vos
                performances en un seul coup d&apos;œil. Plus aucun prospect
                chaud ne passe à la trappe.
          </p>
        </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium text-white shadow-[0_18px_45px_rgba(114,100,255,0.55)] transition-transform duration-300 hover:-translate-y-1"
                style={{ background: gradientPrimary }}
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px]">
                  ▶
                </span>
                Accéder au dashboard
                <span className="translate-x-0 text-xs opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                  en 2 clics
                </span>
              </Link>

              <div className="flex flex-col gap-1 text-[11px] text-slate-600">
                <p>Sans installation. Interface 100 % web.</p>
                <p className="flex items-center gap-1 text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Optimisé pour le suivi quotidien des appels.
                </p>
              </div>
            </div>

            {/* Mini KPI animés */}
            <div className="grid max-w-lg grid-cols-2 gap-3 text-xs">
              <div className="card-slide-left group overflow-hidden rounded-2xl bg-white/80 p-3 shadow-md shadow-slate-200/60 ring-1 ring-slate-100 backdrop-blur transition hover:-translate-y-1 hover:shadow-xl">
                <p className="text-[11px] font-medium text-slate-500">
                  Appels suivis / jour
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  128
                </p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  +18 % vs la semaine dernière
                </p>
              </div>
              <div className="card-slide-right group hover:-translate-y-1 hover:shadow-xl overflow-hidden rounded-2xl bg-slate-900/90 p-3 text-slate-50 shadow-lg shadow-slate-900/60 ring-1 ring-slate-800 backdrop-blur">
                <p className="text-[11px] font-medium text-slate-300">
                  Rappels traités dans les temps
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-50">
                  92 %
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Alertes automatiques avant chaque créneau de rappel.
                </p>
              </div>
            </div>
          </div>

          {/* Colonne droite : carte dashboard animée */}
          <div className="relative flex items-center justify-center">
            {/* Bloc décoratif 3D flottant */}
            <div className="pointer-events-none absolute right-4 top-6 hidden h-40 w-40 transform-gpu rounded-3xl bg-gradient-to-br from-[#dd7fff] via-[#7264ff] to-[#54d4ef] opacity-80 blur-[0.5px] shadow-[0_18px_45px_rgba(15,23,42,0.85)] ring-1 ring-white/20 md:block animate-[tilt3d_18s_ease-in-out_infinite]" />

            <div className="relative w-full max-w-lg card-slide-bottom" style={{ perspective: "1200px" }}>
              <div className="absolute -left-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-tr from-[#dd7fff] to-transparent opacity-70 blur-2xl" />
              <div className="absolute -right-12 bottom-[-2rem] h-24 w-24 rounded-full bg-gradient-to-tr from-[#54d4ef] to-transparent opacity-60 blur-2xl" />

              <div className="relative overflow-hidden rounded-3xl bg-slate-950/90 text-slate-50 shadow-[0_24px_70px_rgba(15,23,42,0.9)] ring-1 ring-slate-800 backdrop-blur-md transform-gpu transition-transform duration-700 hover:-translate-y-2 hover:rotate-[1.5deg]">
                {/* Top bar mock */}
                <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-slate-100">
                      Vue du jour
                    </span>
                  </div>
                  <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] text-slate-400">
                    Aujourd&apos;hui
                  </span>
                </div>

                {/* Fake content */}
                <div className="grid gap-4 px-4 py-4 text-[11px]">
                  <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-[#1f2937] via-[#020617] to-[#020617] p-3">
                      <p className="text-[10px] text-slate-400">
                        File d&apos;appels à traiter
                      </p>
                      <div className="mt-2 space-y-1.5">
                        {["+33 6 45 12 98 76", "+41 79 123 45 67", "+33 1 84 12 67 90"].map(
                          (phone, idx) => (
                            <div
                              key={phone}
                              className="flex items-center justify-between rounded-xl bg-slate-900/60 px-3 py-1.5"
                            >
                              <div className="space-y-0.5">
                                <p className="font-mono text-[11px] text-slate-100">
                                  {phone}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  Vague {idx + 1} • À contacter
                                </p>
                              </div>
                              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 ring-1 ring-emerald-500/40">
                                📞 Appeler
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="rounded-2xl bg-slate-900/80 p-3 ring-1 ring-slate-800">
                        <p className="text-[10px] text-slate-400">
                          Rappels du jour
                        </p>
                        <div className="mt-2 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="truncate text-slate-100">
                              09:30 • Devis assurance
                            </span>
                            <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] text-amber-300">
                              À rappeler
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="truncate text-slate-100">
                              14:00 • RDV bilan retraite
                            </span>
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                              Confirmé
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-gradient-to-r from-[#dd7fff]/20 via-[#7264ff]/10 to-[#54d4ef]/20 p-3 ring-1 ring-[#7264ff]/40">
                        <p className="text-[10px] text-slate-200">
                          Conversion par statut
                        </p>
                        <div className="mt-2 flex items-end gap-1.5">
                          {[60, 35, 20, 10].map((h, idx) => (
                            <div
                              // eslint-disable-next-line react/no-array-index-key
                              key={idx}
                              className="flex-1 rounded-full bg-slate-900/60"
                            >
                              <div
                                className="w-full rounded-full bg-gradient-to-t from-[#7264ff] via-[#dd7fff] to-[#54d4ef] transition-all duration-700"
                                style={{ height: `${h}%` }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800/40 pt-3 text-[10px] text-slate-500">
                    <span>Synchronisé en temps réel avec votre activité.</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-1 text-[10px] text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Session active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Animations globales */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(10px, -14px, 0) scale(1.05);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
        @keyframes tilt3d {
          0% {
            transform: rotate3d(1, -1, 0, 14deg) translate3d(0, 0, 0);
          }
          50% {
            transform: rotate3d(-1, 1, 0, 20deg) translate3d(8px, -14px, 18px);
          }
          100% {
            transform: rotate3d(1, -1, 0, 14deg) translate3d(0, 0, 0);
          }
        }
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(80px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .card-slide-left {
          animation: slideInFromLeft 0.8s ease-out forwards;
          opacity: 0;
        }
        .card-slide-right {
          animation: slideInFromRight 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }
        .card-slide-bottom {
          animation: slideInFromBottom 1s ease-out 0.4s forwards;
          opacity: 0;
        }
        .card-slide-top {
          animation: slideInFromTop 0.6s ease-out forwards;
          opacity: 0;
        }
        .card-slide-top-delayed {
          animation: slideInFromTop 0.6s ease-out 0.1s forwards;
          opacity: 0;
        }
        .typewriter {
          display: inline-block;
          white-space: nowrap;
          overflow: hidden;
          border-right: 2px solid rgba(148, 163, 184, 0.8);
          animation:
            typing 2.5s steps(24, end) infinite alternate,
            blink 0.75s step-end infinite;
        }
        @keyframes typing {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
        @keyframes blink {
          from,
          to {
            border-color: transparent;
          }
          50% {
            border-color: rgba(148, 163, 184, 0.9);
          }
        }
      `}</style>
    </div>
  );
}
