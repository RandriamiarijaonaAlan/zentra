# Module de Gestion RH - Zentra

## Vue d'ensemble

Ce module permet la gestion complète du personnel avec les fonctionnalités suivantes :
- ✅ Gestion des employés (CRUD complet)
- ✅ Gestion des contrats de travail
- ✅ Historique des postes et promotions
- ✅ Gestion des documents RH avec upload

## Structure du projet

### Backend (Spring Boot)

```
src/main/java/org/pentagone/business/zentracore/hr/
├── controller/
│   ├── ContractController.java       # API Contrats
│   ├── EmployeeController.java       # API Employés
│   ├── HRDocumentController.java     # API Documents + Upload
│   └── JobHistoryController.java     # API Historique
├── dto/
│   ├── ContractDto.java             # DTO Contrat (type, durée, essai...)
│   ├── EmployeeDto.java             # DTO Employé (identité, contact, poste)
│   ├── HRDocumentDto.java           # DTO Document
│   └── JobHistoryDto.java           # DTO Historique
├── entity/
│   ├── Contract.java                # Entité Contrat (champs étendus)
│   ├── Employee.java                # Entité Employé (avec photoUrl)
│   └── HRDocument.java              # Entité Document
├── repository/
│   ├── ContractRepository.java      # Repository Contrats
│   ├── HRDocumentRepository.java    # Repository Documents
│   └── JobHistoryRepository.java    # Repository Historique
└── service/
    ├── impl/
    │   ├── ContractServiceImpl.java
    │   ├── EmployeeServiceImpl.java
    │   ├── HRDocumentServiceImpl.java
    │   └── JobHistoryServiceImpl.java
    └── interfaces...
```

### Frontend (React + TypeScript)

```
src/hr/
├── components/
│   ├── ContractManager.tsx          # Gestionnaire de contrats
│   ├── EmployeeForm.tsx             # Formulaire employé (création/édition)
│   ├── EmployeeList.tsx             # Liste des employés
│   ├── HRDocumentManager.tsx        # Gestionnaire de documents
│   └── JobHistoryManager.tsx        # Gestionnaire d'historique
├── pages/
│   ├── DocumentsPage.tsx            # Page documents d'un employé
│   ├── EmployeeContracts.tsx        # Page contrats d'un employé
│   ├── EmployeeCreate.tsx           # Page création employé
│   ├── EmployeeEdit.tsx             # Page édition employé
│   ├── EmployeeProfile.tsx          # Page profil employé
│   ├── EmployeesList.tsx            # Page liste des employés
│   ├── HRHome.tsx                   # Dashboard RH
│   ├── JobHistoryPage.tsx           # Page historique des postes
│   └── UploadDocumentPage.tsx       # Page upload document
├── services/
│   └── hrApi.ts                     # Services API (axios)
└── types/
    ├── contract.ts                  # Types TypeScript
    ├── employee.ts
    ├── hrDocument.ts
    └── jobHistory.ts
```

### Styles CSS

```
src/styles/
├── HRCommon.css                     # Variables et classes communes
├── HRHome.css                       # Dashboard RH
├── EmployeesList.css                # Liste des employés
├── EmployeeForm.css                 # Formulaires
├── EmployeeProfile.css              # Profil employé
├── ManagerComponents.css            # Composants de gestion
└── UploadDocument.css               # Page d'upload
```

## Fonctionnalités détaillées

### 1. Dashboard RH (`/admin/hr`)
- Statistiques du personnel (total, actifs, nouveaux)
- Accès rapide aux fonctions principales
- Navigation vers les autres modules

### 2. Gestion des employés

#### Liste des employés (`/admin/hr/employees`)
- Affichage tabulaire avec nom, poste, téléphone, email
- Recherche par nom, poste ou email
- Actions : Voir, Modifier, Supprimer

#### Création d'employé (`/admin/hr/employees/new`)
- **Identité** : Nom, prénom, date de naissance, genre, photo
- **Contact** : Email professionnel, téléphone, adresse complète
- **Professionnel** : Matricule, ID poste
- Validation côté frontend et backend

#### Profil employé (`/admin/hr/employees/:id`)
- Fiche complète avec photo
- Sections intégrées : Contrats, Historique, Documents
- Actions : Modifier profil, Ajouter document

#### Édition employé (`/admin/hr/employees/:id/edit`)
- Formulaire pré-rempli
- Mêmes champs que la création
- Sauvegarde et retour au profil

### 3. Gestion des contrats

#### Fonctionnalités
- **Type de contrat** : CDI, CDD, Stage, Intérim
- **Durée** : Date début/fin, nombre de mois
- **Période d'essai** : Durée en mois
- **Renouvellement** : Contrat renouvelable ou non
- **Numérotation** : Numéro de contrat unique

#### Affichage
- Liste par employé avec tous les détails
- Badges visuels pour type et renouvellement
- Actions : Ajouter, Modifier, Supprimer

### 4. Historique des postes

#### Fonctionnalités
- Suivi chronologique des changements de poste
- Raison du changement (promotion, mutation, etc.)
- Liens avec postes et départements
- Tri par date (plus récent en premier)

### 5. Documents RH

#### Types de documents supportés
- 🆔 Carte d'identité
- 📘 Passeport  
- 🎓 Diplôme
- 📄 Attestation
- 📋 CV
- 🏆 Certificat
- 📝 Contrat signé
- 📁 Autres

#### Upload de fichiers (`/admin/hr/employees/:id/documents/upload`)
- Interface drag & drop
- Formats acceptés : PDF, DOC, DOCX, JPG, PNG
- Stockage backend dans `uploads/hr-docs/`
- Téléchargement via FileController existant

## API Endpoints

### Employés
- `GET /employees` - Liste tous les employés
- `GET /employees/{id}` - Détails d'un employé
- `POST /employees` - Créer un employé
- `PUT /employees` - Mettre à jour un employé
- `DELETE /employees/{id}` - Supprimer un employé

### Contrats
- `GET /contracts/employee/{employeeId}` - Contrats d'un employé
- `POST /contracts` - Créer un contrat
- `PUT /contracts` - Mettre à jour un contrat
- `DELETE /contracts/{id}` - Supprimer un contrat

### Historique des postes
- `GET /job-histories/employee/{employeeId}` - Historique d'un employé
- `POST /job-histories` - Créer une entrée
- `PUT /job-histories` - Mettre à jour une entrée
- `DELETE /job-histories/{id}` - Supprimer une entrée

### Documents RH
- `GET /hr-documents/employee/{employeeId}` - Documents d'un employé
- `POST /hr-documents/upload` - Upload multipart
- `DELETE /hr-documents/{id}` - Supprimer un document
- `GET /files/download?path={filePath}` - Télécharger un fichier

## Navigation

Accès via la sidebar Admin :
```
Personnel 
├── Dashboard RH           → /admin/hr
├── Liste des employés     → /admin/hr/employees  
└── Ajouter un employé     → /admin/hr/employees/new
```

## Caractéristiques techniques

### Backend
- ✅ Architecture propre (DTO/Service/Controller)
- ✅ Validation des données
- ✅ Gestion d'erreurs avec messages explicites
- ✅ Upload multipart pour les fichiers
- ✅ Mapping manuel simple (pas de MapStruct dans ce module)

### Frontend  
- ✅ TypeScript strict avec interfaces
- ✅ Validation côté client
- ✅ Gestion d'états de chargement
- ✅ Design responsive (mobile-friendly)
- ✅ Confirmation avant suppressions
- ✅ Messages d'erreur utilisateur

### Styles
- ✅ Design moderne avec dégradés
- ✅ Variables CSS centralisées
- ✅ Icônes emoji pour la lisibilité
- ✅ Animations et transitions fluides
- ✅ États visuels (hover, loading, error)

## Démarrage

### Prérequis
- Java 21+
- Node.js 18+
- PostgreSQL (configuré dans application.properties)

### Backend
```bash
cd zentra-core
mvn spring-boot:run
```

### Frontend  
```bash
cd zentra-ui
npm install
npm run dev
```

### Accès
- Backend : http://localhost:8080
- Frontend : http://localhost:3000
- Interface admin : http://localhost:3000/admin/hr

## Intégration avec l'existant

Ce module s'intègre parfaitement avec :
- ✅ Architecture existante (BaseEntity, GlobalExceptionHandler)
- ✅ Sidebar et layout Admin
- ✅ FileController pour les téléchargements
- ✅ Système de routing React Router

Aucune modification des composants existants n'est requise.
