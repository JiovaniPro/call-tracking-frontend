/**
 * Mapping entre les statuts API (backend) et les statuts UI (frontend)
 * Centralisé pour garantir la cohérence dans toute l'application
 */

import type { CallStatus as ApiCallStatus } from "../types/api";
import type { CallStatus as UICallStatus } from "../components/calls/StatusBadge";

// Mapping API → UI
export const mapApiStatusToUI = (status: ApiCallStatus): UICallStatus => {
  const map: Record<ApiCallStatus, UICallStatus> = {
    A_CONTACTER: "À contacter",
    NE_REPOND_PAS: "Ne répond pas",
    RAPPEL: "Rappel",
    NE_TRAVAILLE_PAS_EN_SUISSE: "Ne travaille pas en Suisse",
    RENDEZ_VOUS_FIXE: "Rendez-vous fixé",
    RENDEZ_VOUS_REFIXE: "Rendez-vous refixé",
    MAUVAIS_NUMERO: "Mauvais numéro",
    PAS_INTERESSE: "Pas intéressé",
    FAIRE_MAIL: "Faire mail",
    DOUBLONS: "Doublons",
    DEJA_CLIENT: "Déjà client",
  };
  return map[status] || "À contacter";
};

// Mapping UI → API
export const mapUIStatusToApi = (status: UICallStatus): ApiCallStatus => {
  const map: Record<UICallStatus, ApiCallStatus> = {
    "À contacter": "A_CONTACTER",
    "Ne répond pas": "NE_REPOND_PAS",
    "Rappel": "RAPPEL",
    "Ne travaille pas en Suisse": "NE_TRAVAILLE_PAS_EN_SUISSE",
    "Rendez-vous fixé": "RENDEZ_VOUS_FIXE",
    "Rendez-vous refixé": "RENDEZ_VOUS_REFIXE",
    "Mauvais numéro": "MAUVAIS_NUMERO",
    "Pas intéressé": "PAS_INTERESSE",
    "Faire mail": "FAIRE_MAIL",
    "Doublons": "DOUBLONS",
    "Déjà client": "DEJA_CLIENT",
  };
  return map[status] || "A_CONTACTER";
};

// Liste de tous les statuts UI (pour les selects)
export const ALL_UI_STATUSES: UICallStatus[] = [
  "À contacter",
  "Ne répond pas",
  "Rappel",
  "Ne travaille pas en Suisse",
  "Rendez-vous fixé",
  "Rendez-vous refixé",
  "Mauvais numéro",
  "Pas intéressé",
  "Faire mail",
  "Doublons",
  "Déjà client",
];

// Statuts qui nécessitent une date de rappel
export const STATUSES_REQUIRING_RECALL: UICallStatus[] = [
  "Ne répond pas",
  "Rappel",
];

