import { CallRow } from "../components/dashboard/DataTable";

export const kpiCards = [
  {
    label: "Appels aujourd’hui",
    value: "124",
    helper: "dont 38 nouveaux prospects",
    trend: { value: "+12%", direction: "up" as const },
  },
  {
    label: "Appels ce mois-ci",
    value: "3 482",
    helper: "sur 18 campagnes actives",
    trend: { value: "+8%", direction: "up" as const },
  },
  {
    label: "Contacts intéressés",
    value: "642",
    helper: "taux de conversion 26,3%",
    trend: { value: "+3%", direction: "up" as const },
  },
  {
    label: "Faux numéros",
    value: "57",
    helper: "filtrés automatiquement",
    trend: { value: "-5%", direction: "down" as const },
  },
];

export const monthlyCalls = [
  { month: "Oct", value: 0 },
  { month: "Nov", value: 0 },
  { month: "Déc", value: 630 },
  { month: "Janv", value: 0 },
  { month: "Févr", value: 0 },
  { month: "Mars", value: 0 },
];

export const todayCalls: CallRow[] = [
  {
    id: "1",
    name: "Marie Dupont",
    phone: "+33 6 12 34 56 78",
    status: "intéressé",
    lastCall: "09:24",
    nextReminder: "Aujourd’hui • 15:30",
  },
  {
    id: "2",
    name: "Agence Horizon",
    phone: "+33 1 48 52 98 23",
    status: "à rappeler",
    lastCall: "10:12",
    nextReminder: "Aujourd’hui • 17:00",
  },
  {
    id: "3",
    name: "Paul Martin",
    phone: "+33 7 98 45 67 12",
    status: "sans réponse",
    lastCall: "11:47",
    nextReminder: "Demain • 09:00",
  },
  {
    id: "4",
    name: "Clinique des Lilas",
    phone: "+33 1 39 76 45 12",
    status: "intéressé",
    lastCall: "13:05",
    nextReminder: "Aujourd’hui • 16:15",
  },
];

export const todayReminders: CallRow[] = [
  {
    id: "5",
    name: "Julie Bernard",
    phone: "+33 6 78 23 45 98",
    status: "à rappeler",
    lastCall: "Hier • 17:40",
    nextReminder: "Aujourd’hui • 10:30",
  },
  {
    id: "6",
    name: "Cabinet Lemaire",
    phone: "+33 1 56 87 45 21",
    status: "intéressé",
    lastCall: "Il y a 3 jours",
    nextReminder: "Aujourd’hui • 14:00",
  },
  {
    id: "7",
    name: "Thomas Leroy",
    phone: "+33 7 65 43 21 09",
    status: "sans réponse",
    lastCall: "Ce matin • 08:15",
    nextReminder: "Aujourd’hui • 18:00",
  },
];


