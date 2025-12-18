"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../layout/AppShell";
import { NotificationBell } from "../notifications/NotificationBell";
import { useAuth } from "../../lib/auth";

// Liste d'avatars disponibles dans /public/img (animaux, etc.)
const AVATAR_IMAGES = [
  "/img/BIZARRE.png",
  "/img/ELEPHANT.png",
  "/img/RATON.png",
  "/img/GRENOUILLE.png",
  "/img/LAPIN.png",
  "/img/HIBOU.png",
  "/img/CHIEN.png",
  "/img/PINGUIN.png",
  "/img/PANDA.png",
  "/img/RENARD.png",
];

// Hash très simple et déterministe pour répartir les utilisateurs sur les avatars
const getAvatarForUser = (userId: string) => {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  const index = hash % AVATAR_IMAGES.length;
  return AVATAR_IMAGES[index];
};

export const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  // Get firstName from user object (firstName field or extract from name)
  const firstName = user?.firstName || (user?.name ? user.name.split(" ")[0] : "");
  const fullName = user?.name || (user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`.trim() 
    : user?.firstName || user?.email || "");
  const roleLabel =
    user?.role === "ADMIN" ? "Administrateur" : "Utilisateur";
  // Admin = avatar LION dédié, les autres utilisateurs ont un avatar déterministe
  const avatarSrc = !user
    ? "/img/BIZARRE.png"
    : user.role === "ADMIN"
    ? "/img/ADMIN.png"
    : getAvatarForUser(user.id);

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between border-b px-8 py-4 backdrop-blur-md ${
        isDark
          ? "border-slate-800 bg-[#0f172a]/80 text-white"
          : "border-slate-100 bg-white/80 text-slate-900"
      }`}
      suppressHydrationWarning
    >
      <div>
        <h1 className="text-lg font-semibold">Statistiques d'appels</h1>
        <p
          className={`text-xs ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          Suivez vos appels, conversions et rappels en un coup d'œil.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />

        <button
          onClick={toggleTheme}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${
            isDark
              ? "bg-white/5 text-slate-100 hover:bg-white/10"
              : "bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
          aria-label="Basculer le thème"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200">
              <img
                src={avatarSrc}
                alt={`Avatar de ${firstName || user.name}`}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="hidden text-xs leading-tight sm:block">
              {firstName && (
                <p className="font-semibold">
                  {firstName}
                </p>
              )}
              <p
                className={`text-[10px] ${
                  isDark ? "text-slate-400" : "text-slate-400"
                }`}
              >
                {roleLabel}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200" />
          </div>
        )}
      </div>
    </header>
  );
};
