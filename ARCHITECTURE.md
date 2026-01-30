# Architecture Front-End

## 📐 Principes architecturaux

### 1. Separation of Concerns
- **Core** : Logique métier, services, modèles
- **Features** : Modules fonctionnels par domaine
- **Shared** : Composants réutilisables

### 2. Standalone Components
- Pas de NgModules traditionnels
- Imports directs dans chaque composant
- Lazy loading natif via le router

### 3. Reactive Programming
- RxJS pour la gestion d'état
- Observables pour les flux de données
- BehaviorSubject pour l'état partagé

### 4. Type Safety
- TypeScript strict activé
- Interfaces pour tous les modèles
- Typage fort des services

## 🗂️ Structure détaillée

### Core Layer
```
core/
├── models/           # Modèles de données
│   ├── user.model.ts
│   ├── tender.model.ts
│   ├── submission.model.ts
│   ├── document.model.ts
│   └── notification.model.ts
├── services/         # Services globaux
│   ├── auth.service.ts
│   ├── tender.service.ts (à créer)
│   ├── submission.service.ts (à créer)
│   └── document.service.ts (à créer)
└── guards/           # Guards de routing
    ├── auth.guard.ts
    └── role.guard.ts
```

### Features Layer
```
features/
├── auth/             # Authentification
│   ├── login/
│   └── register/ (à créer)
├── admin/            # Espace Admin
│   ├── dashboard/
│   ├── users/ (à créer)
│   ├── tenders/ (à créer)
│   └── submissions/ (à créer)
├── owner/            # Espace Owner
│   ├── dashboard/
│   ├── tenders/ (à créer)
│   │   ├── list/
│   │   ├── create/
│   │   ├── detail/
│   │   └── edit/
│   └── submissions/ (à créer)
└── supplier/         # Espace Supplier
    ├── dashboard/
    ├── tenders/ (à créer)
    └── submissions/ (à créer)
```

### Shared Layer
```
shared/
├── layouts/          # Layouts par rôle
│   ├── admin-layout/
│   ├── owner-layout/
│   └── supplier-layout/
├── components/ (à créer)
│   ├── ui/          # Composants UI basiques
│   │   ├── button/
│   │   ├── card/
│   │   ├── modal/
│   │   ├── table/
│   │   └── badge/
│   └── business/    # Composants métier réutilisables
│       ├── tender-card/
│       ├── submission-card/
│       └── document-uploader/
└── utils/ (à créer)
    ├── validators/
    └── helpers/
```

## 🔐 Authentification & Autorisation

### AuthService
- Gestion de l'utilisateur courant
- Token JWT mocké
- Persistance localStorage
- Observables pour l'état

### Guards
- **authGuard** : Vérifie l'authentification
- **roleGuard** : Vérifie les rôles autorisés

### Flow d'authentification
```
1. User → Login Form
2. AuthService.login() → Mock API call
3. Store user + token in localStorage
4. Emit currentUser$ observable
5. Router → Redirect by role
6. Guards protect routes
```

## 🛣️ Routing Strategy

### Structure
```
/
├── auth/
│   ├── login
│   └── register
├── admin/           [authGuard, roleGuard(ADMIN)]
│   ├── dashboard
│   ├── users
│   ├── tenders
│   └── submissions
├── owner/           [authGuard, roleGuard(OWNER)]
│   ├── dashboard
│   ├── tenders
│   │   ├── list
│   │   ├── create
│   │   └── :id
│   └── submissions
└── supplier/        [authGuard, roleGuard(SUPPLIER)]
    ├── dashboard
    ├── tenders
    └── submissions
```

### Lazy Loading
Tous les modules features sont chargés à la demande via `loadComponent()`.

## 📊 State Management

### Approche actuelle : Services + RxJS
- **AuthService** : État utilisateur
- **BehaviorSubject** : État partagé
- **Observables** : Flux de données

### Future évolution possible
- NgRx pour état complexe
- Signals Angular pour réactivité fine

## 🎨 Design System

### Layouts
- Sidebar collapsible
- Header avec user info
- Content area scrollable
- Responsive design

### Couleurs
```scss
// Admin
$admin-primary: #1e3a8a;
$admin-secondary: #1e40af;

// Owner
$owner-primary: #059669;
$owner-secondary: #10b981;

// Supplier
$supplier-primary: #7c3aed;
$supplier-secondary: #8b5cf6;
```

### Composants UI (à créer)
- Buttons (primary, secondary, danger)
- Cards (hover effects, shadows)
- Forms (inputs, selects, file upload)
- Tables (sortable, filterable)
- Modals (confirmation, forms)
- Badges (status indicators)
- Loaders (spinners, skeletons)

## 🔌 Backend Integration (Future)

### Services HTTP
Chaque service aura une méthode pour basculer entre mock et API réelle :

```typescript
@Injectable({ providedIn: 'root' })
export class TenderService {
  private useMock = true; // Toggle pour dev

  getTenders(): Observable<Tender[]> {
    return this.useMock 
      ? this.getMockTenders()
      : this.http.get<Tender[]>('/api/tenders');
  }
}
```

### Interceptors (à créer)
- **AuthInterceptor** : Ajouter token JWT
- **ErrorInterceptor** : Gestion erreurs globales
- **LoadingInterceptor** : Indicateur de chargement

### Environment Config
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  useMockData: true
};
```

## 📦 Modules NPM recommandés (optionnel)

### UI Libraries
- Angular Material
- PrimeNG
- Tailwind CSS

### Utilities
- date-fns (manipulation dates)
- lodash (utilitaires)
- chart.js (graphiques)

### Forms
- ngx-mask (masques input)
- ngx-file-drop (upload fichiers)

## 🧪 Testing Strategy (à implémenter)

### Unit Tests
- Services : Jasmine + Karma
- Components : TestBed
- Guards : Router testing

### E2E Tests
- Playwright ou Cypress
- Scénarios par rôle

## 🚀 Performance

### Optimisations actuelles
- Lazy loading des routes
- OnPush change detection (à implémenter)
- TrackBy dans les ngFor (à implémenter)

### Optimisations futures
- Virtual scrolling pour grandes listes
- Image lazy loading
- Service Workers (PWA)

## 📝 Conventions de code

### Naming
- Components : `feature-name.component.ts`
- Services : `feature-name.service.ts`
- Models : `feature-name.model.ts`
- Guards : `feature-name.guard.ts`

### Structure fichier
```
feature/
├── feature.component.ts
├── feature.component.html
├── feature.component.scss
└── feature.component.spec.ts
```

### Imports order
1. Angular core
2. Angular common
3. Third-party
4. App core
5. App shared
6. Relative imports
