# Self-Service Employé - Zentra RH

## 📋 Vue d'ensemble

Module complet de self-service pour les employés permettant de gérer leur profil, congés, bulletins de paie, demandes d'attestations, notes de frais et messagerie RH.

## ✨ Fonctionnalités implémentées

### 1. Gestion du Profil Employé
- ✅ Consultation des informations personnelles
- ✅ Mise à jour des coordonnées modifiables (téléphone, adresse, ville, pays, genre)
- ✅ Données protégées (salaire, email pro, numéro employé) en lecture seule

### 2. Gestion des Congés
- ✅ Consultation du solde de congés (annuels, maladie, exceptionnels)
- ✅ Historique des demandes de congés
- ✅ Création de nouvelles demandes avec calcul automatique des jours
- ✅ Annulation des demandes en attente
- ✅ Validation du solde disponible avant soumission

### 3. Bulletins de Paie
- ✅ Consultation des bulletins par année
- ✅ Affichage détaillé (brut, net, déductions, primes)
- ✅ Téléchargement sécurisé des bulletins PDF
- ✅ Historique sur 5 ans

### 4. Demandes d'Attestations
- ✅ Types: Attestation de travail, salaire, fiscale, contrat
- ✅ Suivi du statut (En attente, En cours, Prête, Livrée)
- ✅ Téléchargement des documents générés
- ✅ Motif de la demande

### 5. Notes de Frais
- ✅ Création de notes de frais avec catégories
- ✅ Catégories: Transport, Repas, Hébergement, Fournitures, etc.
- ✅ Suivi du statut (En attente, Approuvée, Rejetée, Payée)
- ✅ Annulation des notes en attente
- ✅ Upload de justificatifs (à finaliser)
- ✅ Tableau de bord avec totaux

### 6. Messagerie RH
- ✅ Conversations par thread avec RH
- ✅ Création de nouvelles conversations
- ✅ Historique des échanges
- ✅ Interface temps réel type chat

## 🏗️ Architecture Backend

### Entités créées
```
hr.entity/
├── Payslip.java          - Bulletins de paie
├── DocumentRequest.java  - Demandes d'attestations
├── ExpenseClaim.java     - Notes de frais
├── HrMessage.java        - Messages RH
├── LeaveBalance.java     - Soldes de congés
└── LeaveRequest.java     - Demandes de congés
```

### Repositories
```
hr.repository/
├── PayslipRepository.java
├── DocumentRequestRepository.java
├── ExpenseClaimRepository.java
├── HrMessageRepository.java
├── LeaveBalanceRepository.java
└── LeaveRequestRepository.java
```

### Service Principal
- `SelfServiceEmployeeService` + `SelfServiceEmployeeServiceImpl`
- Logique métier complète avec validation
- Calcul automatique des jours ouvrés
- Vérification des soldes de congés
- Gestion des statuts et transitions

### Controller REST
- `SelfServiceController`: Endpoints `/api/self/**`
- Profil: GET/PUT `/api/self/profile`
- Congés: GET/POST `/api/self/leave/**`
- Bulletins: GET `/api/self/payslips`
- Attestations: GET/POST `/api/self/doc-requests`
- Notes de frais: GET/POST `/api/self/expense-claims`
- Messagerie: GET/POST `/api/self/messages/**`

## 🎨 Architecture Frontend

### Pages React créées
```
pages/
├── EmployeeProfilePage.tsx    - Profil et coordonnées
├── LeaveDashboard.tsx         - Gestion congés
├── PayslipsPage.tsx           - Bulletins de paie
├── DocumentRequestsPage.tsx   - Attestations
├── ExpenseClaimsPage.tsx      - Notes de frais
└── HrMessagingPage.tsx        - Messagerie RH
```

### Types TypeScript
- `types/selfService.ts`: Interfaces complètes pour tous les objets

### Services API
- `services/selfService.ts`: Appels HTTP axios vers backend

### Styles CSS
- Styles modulaires pour chaque page
- Design responsive
- Composants réutilisables

## 🗄️ Base de données

### Scripts SQL créés
```
src/main/resources/sql/
├── self_service_tables.sql   - Création des tables
└── self_service_data.sql     - Données de test
```

### Tables créées
- `payslip` - Bulletins de paie
- `document_request` - Demandes d'attestations
- `expense_claim` - Notes de frais
- `hr_message` - Messages RH
- `leave_balance` - Soldes de congés
- `leave_request` - Demandes de congés

## 🚀 Installation et Démarrage

### 1. Backend (Spring Boot)

```powershell
# Appliquer les migrations SQL
cd zentra-core
# Exécuter les scripts dans PostgreSQL
psql -U postgres -d zentra_db -f src/main/resources/sql/self_service_tables.sql
psql -U postgres -d zentra_db -f src/main/resources/sql/self_service_data.sql

# Lancer l'application
./mvnw spring-boot:run
```

### 2. Frontend (React + Vite)

```powershell
cd zentra-ui
npm install
npm run dev
```

## 📝 Configuration requise

### Backend
- Java 17+
- Spring Boot 3.x
- PostgreSQL
- Dépendances: Spring Data JPA, Lombok, Spring Security

### Frontend
- Node.js 18+
- React 18
- TypeScript
- Axios
- Vite

## 🔒 Sécurité

### Configuration actuelle (à finaliser)
- Fichier: `config/SecurityConfiguration.java`
- Routes `/api/self/**` actuellement en `permitAll()` pour développement
- **TODO**: Intégrer authentification JWT/OAuth2
- **TODO**: Remplacer `@RequestParam employeeId` par extraction du contexte de sécurité
- **TODO**: Implémenter rôles EMPLOYEE, HR, ADMIN

### Points de sécurité implémentés
- ✅ Vérification de propriété (ownership) dans les services
- ✅ Interdiction d'accès aux données d'autres employés
- ✅ Validation des transitions de statut
- ✅ CORS configuré pour développement local

## 🧪 Tests

### Endpoints à tester avec employeeId=1 (exemple)

```http
### Profil
GET http://localhost:8080/api/self/profile?employeeId=1

### Solde congés
GET http://localhost:8080/api/self/leave/balance?employeeId=1&year=2024

### Demandes de congés
GET http://localhost:8080/api/self/leave/requests?employeeId=1

### Création demande congé
POST http://localhost:8080/api/self/leave/requests?employeeId=1
Content-Type: application/json

{
  "startDate": "2024-12-23",
  "endDate": "2024-12-27",
  "type": "ANNUAL",
  "reason": "Vacances de Noël"
}

### Bulletins de paie
GET http://localhost:8080/api/self/payslips?employeeId=1&year=2024

### Attestations
GET http://localhost:8080/api/self/doc-requests?employeeId=1

### Notes de frais
GET http://localhost:8080/api/self/expense-claims?employeeId=1
```

## 📌 TODO / Améliorations futures

### Haute priorité
- [ ] Intégrer authentification réelle (JWT/OAuth2)
- [ ] Remplacer employeeId dans les paramètres par contexte de sécurité
- [ ] Implémenter gestion de rôles et permissions
- [ ] Finaliser upload de fichiers (justificatifs, pièces jointes)
- [ ] Endpoint de téléchargement sécurisé de fichiers

### Fonctionnalités avancées
- [ ] Notifications push/email lors de changements de statut
- [ ] Dashboard récapitulatif employé
- [ ] Calendrier intégré pour visualisation des congés
- [ ] Workflow d'approbation multi-niveaux
- [ ] Export Excel/PDF des historiques
- [ ] Recherche et filtres avancés
- [ ] Mode dark/light

### Optimisations techniques
- [ ] Pagination des listes
- [ ] Cache des données fréquentes
- [ ] Lazy loading des images/fichiers
- [ ] Tests unitaires et d'intégration
- [ ] Documentation API (Swagger/OpenAPI)
- [ ] Logs structurés et monitoring

## 📚 Routes Frontend (à intégrer dans App.tsx)

```typescript
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import LeaveDashboard from './pages/LeaveDashboard';
import PayslipsPage from './pages/PayslipsPage';
import DocumentRequestsPage from './pages/DocumentRequestsPage';
import ExpenseClaimsPage from './pages/ExpenseClaimsPage';
import HrMessagingPage from './pages/HrMessagingPage';

// Dans le router
<Route path="/self-service/profile" element={<EmployeeProfilePage />} />
<Route path="/self-service/leaves" element={<LeaveDashboard />} />
<Route path="/self-service/payslips" element={<PayslipsPage />} />
<Route path="/self-service/documents" element={<DocumentRequestsPage />} />
<Route path="/self-service/expenses" element={<ExpenseClaimsPage />} />
<Route path="/self-service/messages" element={<HrMessagingPage />} />
```

## 👥 Équipe de développement

Module développé pour le système RH Zentra.

## 📄 Licence

Propriétaire - Tous droits réservés
