# Plateforme de Gestion des Marchés Publics

Application Angular moderne pour la gestion complète du cycle de vie des marchés publics.

## 🎯 Objectif

Plateforme web permettant de gérer les appels d'offres publics depuis la publication jusqu'à l'attribution, avec 3 rôles distincts : ADMIN, OWNER, et SUPPLIER.

## 🏗️ Architecture

### Technologies
- **Angular 21** (Standalone Components)
- **TypeScript** (strict mode)
- **RxJS** pour la gestion d'état
- **SCSS** pour les styles
- **Angular Router** avec guards par rôle

### Structure du projet

```
src/app/
├── core/                      # Services et modèles globaux
│   ├── models/               # Interfaces TypeScript
│   │   ├── user.model.ts
│   │   ├── tender.model.ts
│   │   ├── submission.model.ts
│   │   ├── document.model.ts
│   │   └── notification.model.ts
│   ├── services/             # Services métier
│   │   └── auth.service.ts   # Authentification mockée
│   └── guards/               # Guards de routing
│       ├── auth.guard.ts
│       └── role.guard.ts
│
├── features/                  # Modules fonctionnels
│   ├── auth/                 # Authentification
│   │   └── login/
│   ├── admin/                # Espace Admin
│   │   └── dashboard/
│   ├── owner/                # Espace Owner
│   │   └── dashboard/
│   └── supplier/             # Espace Supplier
│       └── dashboard/
│
└── shared/                    # Composants partagés
    └── layouts/              # Layouts par rôle
        ├── admin-layout/
        ├── owner-layout/
        └── supplier-layout/
```

## 👥 Rôles utilisateurs

### ADMIN (Administrateur)
- Supervision globale de la plateforme
- Gestion des utilisateurs
- Vue d'ensemble des appels d'offres et soumissions

### OWNER (Administration publique)
- Création et publication d'appels d'offres
- Définition des critères d'évaluation
- Évaluation des soumissions
- Attribution des marchés

### SUPPLIER (Entreprise)
- Consultation des appels d'offres ouverts
- Dépôt de soumissions
- Suivi des candidatures

## 🚀 Démarrage

### Installation
```bash
npm install
```

### Développement
```bash
ng serve
```
L'application sera accessible sur `http://localhost:4200/`

### Build
```bash
ng build
```

## 🔐 Authentification (Mock)

L'authentification est actuellement mockée. Utilisez ces comptes de test :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@platform.gov | password123 |
| Owner | owner@ministry.gov | password123 |
| Supplier | supplier@company.com | password123 |

Sur la page de login, des boutons de connexion rapide sont disponibles pour faciliter les tests.

## 🎨 Design System

### Couleurs par rôle
- **Admin** : Bleu (#1e3a8a → #1e40af)
- **Owner** : Vert (#059669 → #10b981)
- **Supplier** : Violet (#7c3aed → #8b5cf6)

### Composants UI
- Layouts responsives avec sidebar collapsible
- Cards avec hover effects
- Formulaires stylisés
- Système de navigation par rôle

## 📋 État actuel

### ✅ Implémenté
- Architecture complète du projet
- Routing avec guards par rôle
- Authentification mockée (localStorage)
- Layouts pour les 3 rôles
- Dashboards de base
- Page de login avec connexion rapide
- Design system moderne

### 🚧 À implémenter
- Écrans métier détaillés (tenders, submissions)
- Services mockés pour les données métier
- Formulaires de création/édition
- Gestion des documents
- Système de notifications
- Intégration future avec backend microservices

## 🔄 Workflow prévu

1. **OWNER** crée un appel d'offre → définit critères → publie
2. **SUPPLIER** consulte → télécharge docs → soumet candidature
3. **OWNER** évalue → calcule scores → attribue marché
4. **ADMIN** supervise l'ensemble du processus

## 🛠️ Prochaines étapes

1. Implémenter les services mockés pour tenders et submissions
2. Créer les écrans de gestion des appels d'offres
3. Développer les formulaires de soumission
4. Ajouter la gestion des documents
5. Implémenter le système de notifications
6. Préparer l'intégration backend (interfaces HTTP)

## 📝 Notes techniques

- **Standalone Components** : Pas de NgModules, imports directs
- **TypeScript strict** : Typage fort partout
- **Guards fonctionnels** : Utilisation de `CanActivateFn`
- **Lazy loading** : Routes chargées à la demande
- **RxJS** : BehaviorSubject pour l'état utilisateur
- **LocalStorage** : Persistance de session mockée

## 🔗 Backend futur

L'architecture front est alignée avec les microservices prévus :
- User-Service
- Tender-Service
- Submission-Service
- Document-Service
- Notification-Service
- RAG-Service (IA)

Les services Angular sont prêts à être connectés via HTTP sans refactoring majeur.
