# 📋 Instructions : Implémentation de la pagination serveur pour "À appeler"

## 🎯 Objectif

Transformer la pagination **côté client** actuelle en pagination **côté serveur** pour la section **"À appeler"** (`/calls`). Actuellement, tous les appels avec statut `A_CONTACTER` sont chargés en une seule requête, puis paginés en mémoire (9 par page). L'objectif est de ne charger que **9 appels à la fois** depuis le serveur, et de refaire une requête à chaque changement de page.

---

## 📊 Pages et composants impactés

### ✅ Pages qui DOIVENT être modifiées

1. **`app/calls/CallPage.tsx`** ⚠️ **IMPACT MAJEUR**
   - Utilise actuellement `useCalls(apiFilters)` qui charge TOUS les appels
   - Filtre ensuite côté client pour garder uniquement `A_CONTACTER`
   - Utilise `CallsTable` avec pagination côté client
   - **Action** : Remplacer par un hook de pagination serveur dédié

2. **`components/calls/CallsTable.tsx`** ⚠️ **IMPACT MAJEUR**
   - Fait actuellement `rows.slice()` pour paginer côté client
   - Gère l'état `currentPage` en interne
   - **Action** : Transformer en composant "contrôlé" qui reçoit les données déjà paginées + callbacks

### ⚠️ Pages qui pourraient être impactées (selon choix d'implémentation)

3. **`app/history/HistoryPage.tsx`** 
   - Utilise `useCalls()` sans filtres pour charger TOUS les appels
   - Filtre ensuite côté client pour exclure `A_CONTACTER`
   - **Action** : 
     - **Option A** : Garder `useCalls()` tel quel (pas de pagination serveur pour le journal)
     - **Option B** : Implémenter aussi la pagination serveur pour le journal (recommandé si beaucoup d'appels)

4. **`app/today/TodayPage.tsx`**
   - N'utilise PAS directement `useCalls()`
   - Utilise `useTodayReport()` qui vient de `/reports/today`
   - **Action** : Aucune modification nécessaire (déjà optimisé via endpoint dédié)

5. **`app/dashboard/DasboardPage.tsx`**
   - Utilise `useTodayReport()` pour afficher les 3 premiers appels du jour
   - **Action** : Aucune modification nécessaire (déjà limité à 3 éléments)

### 📦 Fichiers utilitaires à modifier

6. **`lib/api.ts`**
   - Fonction `callsApi.getAll()` actuelle
   - **Action** : Ajouter une nouvelle fonction `callsApi.getQueue()` pour la pagination serveur

7. **`lib/hooks.ts`**
   - Hook `useCalls()` actuel
   - **Action** : Créer un nouveau hook `useCallsQueue()` pour la pagination serveur

8. **`types/api.ts`**
   - Type `CallsFilter` actuel
   - **Action** : Ajouter type `PaginatedCallsResponse` avec `{ items, total, page, pageSize }`

### 🔧 Backend à modifier

9. **`src/modules/calls/routes.ts`**
   - Endpoint `GET /calls` actuel qui retourne tous les appels
   - **Action** : 
     - **Option A** : Modifier l'endpoint existant pour supporter `page` et `pageSize`
     - **Option B** : Créer un nouvel endpoint `GET /calls/queue` dédié à la file d'appels avec pagination

---

## 🛠️ Plan d'implémentation détaillé

### Étape 1 : Backend - Ajouter la pagination serveur

#### Option recommandée : Créer un endpoint dédié `/calls/queue`

**Fichier** : `call-tracking-backend/src/modules/calls/routes.ts`

```typescript
// Nouvel endpoint GET /calls/queue?page=1&pageSize=9&search=&status=&type=&from=&to=
callsRouter.get("/queue", authRequired, async (req, res, next) => {
  try {
    const user = req.user!;
    const { 
      page = "1", 
      pageSize = "9", 
      search, 
      status, 
      type, 
      from, 
      to 
    } = req.query as {
      page?: string;
      pageSize?: string;
      search?: string;
      status?: CallStatus;
      type?: string;
      from?: string;
      to?: string;
    };

    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 9;
    const skip = (pageNum - 1) * pageSizeNum;

    const where: any = {
      ...buildOwnershipWhere(user.id, user.role === "ADMIN"),
      // IMPORTANT : Filtrer uniquement sur A_CONTACTER pour la file d'appels
      status: CallStatus.A_CONTACTER,
    };

    // Appliquer les autres filtres (search, type, dates)
    if (type) {
      where.type = type;
    }
    if (from || to) {
      where.occurredAt = {};
      if (from) where.occurredAt.gte = new Date(from);
      if (to) where.occurredAt.lte = new Date(to);
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { fromNumber: { contains: search, mode: "insensitive" } },
        { toNumber: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    // IMPORTANT : Tri identique à celui du frontend
    // 1. Par vague croissante (waveNumber ASC)
    // 2. Puis par nom de famille alphabétique (lastName ASC)
    // 3. Puis par prénom alphabétique (firstName ASC)
    const orderBy: any[] = [
      { waveNumber: { sort: "asc", nulls: "last" } },
      { lastName: "asc" },
      { firstName: "asc" },
    ];

    // Requête avec pagination
    const [calls, total] = await Promise.all([
      prisma.call.findMany({
        where,
        orderBy,
        skip,
        take: pageSizeNum,
      }),
      prisma.call.count({ where }),
    ]);

    return res.json({
      items: calls,
      total,
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages: Math.ceil(total / pageSizeNum),
    });
  } catch (error) {
    next(error);
  }
});
```

**Points importants** :
- Filtrer automatiquement sur `status: A_CONTACTER` (file d'appels)
- Tri identique au frontend : vague → nom → prénom
- Retourner `{ items, total, page, pageSize, totalPages }` pour permettre la pagination côté frontend

---

### Étape 2 : Frontend - Types TypeScript

**Fichier** : `call-tracking-frontend/types/api.ts`

```typescript
// Ajouter après CallsFilter
export interface PaginatedCallsResponse {
  items: Call[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Modifier CallsFilter pour ajouter pagination (optionnel)
export interface CallsFilter {
  search?: string;
  status?: CallStatus;
  type?: CallType;
  from?: string;
  to?: string;
  // Nouveaux champs pour pagination
  page?: number;
  pageSize?: number;
}
```

---

### Étape 3 : Frontend - API Client

**Fichier** : `call-tracking-frontend/lib/api.ts`

```typescript
// Dans callsApi, ajouter :
export const callsApi = {
  // ... fonctions existantes ...

  // Nouvelle fonction pour la file d'appels avec pagination serveur
  getQueue: async (
    page: number = 1,
    pageSize: number = 9,
    filters?: Omit<CallsFilter, "page" | "pageSize">
  ): Promise<PaginatedCallsResponse> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());
    
    if (filters?.search) params.append("search", filters.search);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.from) params.append("from", filters.from);
    if (filters?.to) params.append("to", filters.to);

    const query = params.toString();
    return apiFetch<PaginatedCallsResponse>(`/calls/queue?${query}`);
  },
};
```

---

### Étape 4 : Frontend - Hook personnalisé

**Fichier** : `call-tracking-frontend/lib/hooks.ts`

```typescript
// Ajouter après useCalls
export function useCallsQueue(
  page: number = 1,
  pageSize: number = 9,
  filters?: Omit<CallsFilter, "page" | "pageSize">
) {
  return useApi<PaginatedCallsResponse>(
    () => callsApi.getQueue(page, pageSize, filters),
    [page, pageSize, filters?.search, filters?.type, filters?.from, filters?.to]
  );
}
```

---

### Étape 5 : Frontend - Modifier CallsTable pour être "contrôlé"

**Fichier** : `call-tracking-frontend/components/calls/CallsTable.tsx`

**Changements** :
1. Supprimer la pagination interne (`currentPage`, `itemsPerPage`, `slice`)
2. Recevoir les props :
   - `rows: CallRow[]` (déjà paginées)
   - `total: number` (nombre total d'éléments)
   - `currentPage: number` (page actuelle)
   - `totalPages: number` (nombre total de pages)
   - `onPageChange: (page: number) => void` (callback pour changer de page)

**Avant** :
```typescript
export const CallsTable: React.FC<CallsTableProps> = ({
  rows,
  onView,
  onEdit,
  onDelete,
}) => {
  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);
  
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return rows.slice(startIndex, startIndex + itemsPerPage);
  }, [rows, currentPage]);
  
  // ...
};
```

**Après** :
```typescript
type CallsTableProps = {
  rows: CallRow[];
  total: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView?: (row: CallRow) => void;
  onEdit?: (row: CallRow) => void;
  onDelete?: (row: CallRow) => void;
};

export const CallsTable: React.FC<CallsTableProps> = ({
  rows,
  total,
  currentPage,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}) => {
  // Plus de slice, on utilise directement rows
  // ...
  
  // Pagination utilise les props reçues
  <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
    Précédent
  </button>
  <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
    Suivant
  </button>
};
```

---

### Étape 6 : Frontend - Modifier CallPage pour utiliser la pagination serveur

**Fichier** : `call-tracking-frontend/app/calls/CallPage.tsx`

**Changements** :
1. Remplacer `useCalls(apiFilters)` par `useCallsQueue(page, 9, apiFilters)`
2. Ajouter un état `const [currentPage, setCurrentPage] = useState(1)`
3. Supprimer le filtrage côté client sur `A_CONTACTER` (déjà fait par le backend)
4. Supprimer le tri côté client (déjà fait par le backend)
5. Passer les props de pagination à `CallsTable`

**Avant** :
```typescript
const { data: calls, isLoading, error, refetch } = useCalls(apiFilters);

const rows = useMemo(() => {
  const filtered = (calls || []).filter((call) => call.status === "A_CONTACTER");
  const mapped = filtered.map(mapCallToRow);
  mapped.sort(/* tri complexe */);
  return mapped;
}, [calls]);
```

**Après** :
```typescript
const [currentPage, setCurrentPage] = useState(1);
const { data: paginatedData, isLoading, error, refetch } = useCallsQueue(
  currentPage,
  9,
  apiFilters
);

const rows = useMemo(() => {
  if (!paginatedData) return [];
  return paginatedData.items.map(mapCallToRow);
}, [paginatedData]);

// Dans le JSX
<CallsTable
  rows={rows}
  total={paginatedData?.total || 0}
  currentPage={currentPage}
  totalPages={paginatedData?.totalPages || 1}
  onPageChange={(page) => {
    setCurrentPage(page);
    // Optionnel : scroll vers le haut du tableau
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}
  onView={...}
  onEdit={...}
  onDelete={...}
/>
```

**Important** : Réinitialiser `currentPage` à 1 quand les filtres changent :
```typescript
useEffect(() => {
  setCurrentPage(1);
}, [apiFilters]);
```

---

## ✅ Checklist de validation

- [ ] Backend : Endpoint `/calls/queue` créé avec pagination
- [ ] Backend : Tri identique au frontend (vague → nom → prénom)
- [ ] Backend : Filtre automatique sur `A_CONTACTER`
- [ ] Frontend : Type `PaginatedCallsResponse` ajouté
- [ ] Frontend : Fonction `callsApi.getQueue()` créée
- [ ] Frontend : Hook `useCallsQueue()` créé
- [ ] Frontend : `CallsTable` transformé en composant contrôlé
- [ ] Frontend : `CallPage` utilise `useCallsQueue` au lieu de `useCalls`
- [ ] Frontend : Pagination réinitialisée à page 1 quand filtres changent
- [ ] Test : Charger la page "À appeler" → vérifier que seulement 9 appels sont chargés
- [ ] Test : Cliquer sur "Suivant" → vérifier qu'une nouvelle requête est faite
- [ ] Test : Changer les filtres → vérifier que la page revient à 1
- [ ] Test : Vérifier que le tri (vague → nom → prénom) est respecté

---

## 🔄 Impact sur les autres pages

### `HistoryPage.tsx` (Journal des appels)

**Recommandation** : **Option A** - Garder `useCalls()` tel quel pour l'instant

**Raison** :
- Le journal affiche TOUS les appels (pas seulement `A_CONTACTER`)
- La pagination serveur pourrait être ajoutée plus tard si nécessaire
- Le journal est moins critique en termes de performance (moins de consultations fréquentes)

**Si on veut aussi paginer le journal** :
- Créer un endpoint `/calls/history` similaire à `/calls/queue`
- Filtrer sur `status !== A_CONTACTER`
- Trier par `occurredAt DESC` (chronologique)

### `TodayPage.tsx` et `DasboardPage.tsx`

**Aucune modification nécessaire** :
- Utilisent déjà des endpoints optimisés (`/reports/today`)
- Affichent seulement quelques éléments (3-9 max)
- Pas de pagination nécessaire

---

## 📝 Notes importantes

1. **Performance** : La pagination serveur réduit drastiquement la quantité de données transférées et le temps de chargement initial, surtout avec beaucoup de prospects.

2. **Tri** : Le tri doit être **identique** entre backend et frontend pour éviter les incohérences. Le backend doit trier exactement comme le frontend le faisait avant.

3. **Filtres** : Quand les filtres changent, réinitialiser toujours `currentPage` à 1 pour éviter d'être sur une page vide.

4. **Compatibilité** : L'endpoint `/calls` existant doit rester fonctionnel pour `HistoryPage` et autres usages. Ne pas casser la compatibilité.

5. **Tests** : Tester avec :
   - Beaucoup de données (1000+ appels `A_CONTACTER`)
   - Changement de page rapide
   - Changement de filtres pendant la navigation
   - Recherche avec résultats paginés

---

## 🚀 Ordre d'implémentation recommandé

1. **Backend** : Créer l'endpoint `/calls/queue` (testable avec Postman/curl)
2. **Types** : Ajouter `PaginatedCallsResponse` dans `types/api.ts`
3. **API Client** : Ajouter `callsApi.getQueue()`
4. **Hook** : Créer `useCallsQueue()`
5. **Composant** : Modifier `CallsTable` pour être contrôlé
6. **Page** : Modifier `CallPage` pour utiliser la pagination serveur
7. **Tests** : Valider chaque étape avant de passer à la suivante

---

**Dernière mise à jour** : Décembre 2024

