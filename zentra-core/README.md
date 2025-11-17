# 🏢 Zentra Core - Module RH

## Vue d'ensemble

**Zentra Core** est le backend de la plateforme Zentra, une solution complète de gestion des ressources humaines. Ce module offre une API REST robuste pour gérer tous les aspects des RH d'une entreprise.

---

## 📦 Modules disponibles

### ✅ Gestion des Besoins en Personnel (NOUVEAU)
Module complet pour gérer les demandes de recrutement de l'entreprise.

**Fonctionnalités** :
- ✅ CRUD complet (Create, Read, Update, Delete)
- ✅ Filtrage par département, poste, statut, priorité
- ✅ Validation des données
- ✅ Audit automatique (timestamps)
- ✅ 9 endpoints REST
- ✅ Tests unitaires complets

**Documentation** : Voir [STAFFING_NEED_MODULE.md](./STAFFING_NEED_MODULE.md)

### Autres modules RH
- Gestion des départements
- Gestion des postes
- Gestion des employés
- Gestion des contrats
- Gestion des candidats
- Gestion des publications d'offres
- Gestion des entretiens
- Gestion des QCM et évaluations

---

## 🚀 Démarrage rapide

### Prérequis
- Java 17+
- Maven 3.6+
- PostgreSQL 13+

### Installation

```bash
# 1. Cloner le projet
git clone [repository]
cd zentra/zentra-core

# 2. Configurer la base de données
createdb zentra
psql zentra < src/main/resources/sql/table_rh.sql

# 3. Configurer application.properties
# Modifier les credentials si nécessaire

# 4. Compiler et lancer
./mvnw spring-boot:run
```

L'API est accessible sur : `http://localhost:8080/api`

**Guide détaillé** : Voir [QUICK_START.md](./QUICK_START.md)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [PROJECT_COMPLETE.md](./PROJECT_COMPLETE.md) | ✅ Résumé complet du projet |
| [STAFFING_NEED_API.md](./STAFFING_NEED_API.md) | 📘 Documentation API REST |
| [STAFFING_NEED_MODULE.md](./STAFFING_NEED_MODULE.md) | 📗 Architecture du module |
| [STAFFING_NEED_SUMMARY.md](./STAFFING_NEED_SUMMARY.md) | 📙 Résumé détaillé |
| [QUICK_START.md](./QUICK_START.md) | 🚀 Guide de démarrage |
| [FEATURES_LIST.md](./FEATURES_LIST.md) | 📋 Liste des fonctionnalités |

---

## 🔌 API Endpoints

### Besoins en Personnel

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/staffing-needs` | Créer un besoin |
| PUT | `/api/staffing-needs/{id}` | Modifier un besoin |
| GET | `/api/staffing-needs/{id}` | Obtenir un besoin |
| GET | `/api/staffing-needs` | Lister tous les besoins |
| GET | `/api/staffing-needs/department/{id}` | Par département |
| GET | `/api/staffing-needs/job/{id}` | Par poste |
| GET | `/api/staffing-needs/status/{status}` | Par statut |
| GET | `/api/staffing-needs/priority/{priority}` | Par priorité |
| DELETE | `/api/staffing-needs/{id}` | Supprimer un besoin |

---

## 🧪 Tests

### Tests unitaires

```bash
# Exécuter tous les tests
./mvnw test

# Tests pour le module Staffing Needs
./mvnw test -Dtest=StaffingNeedServiceTest
```

### Tests avec Postman

```bash
# Importer la collection
Zentra_Staffing_Needs_API.postman_collection.json
```

14 requêtes prêtes à l'emploi pour tester l'API.

---

## 🏗️ Architecture

### Structure du projet

```
zentra-core/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── org/pentagone/business/zentracore/
│   │   │       ├── common/          # Entités et utils communs
│   │   │       └── hr/              # Module RH
│   │   │           ├── entity/      # Entités JPA
│   │   │           ├── dto/         # Data Transfer Objects
│   │   │           ├── repository/  # Repositories JPA
│   │   │           ├── mapper/      # MapStruct mappers
│   │   │           ├── service/     # Services métier
│   │   │           └── controller/  # Controllers REST
│   │   └── resources/
│   │       ├── application.properties
│   │       └── sql/                 # Scripts SQL
│   └── test/                        # Tests unitaires
├── target/                          # Compilation
└── pom.xml                          # Configuration Maven
```

### Technologies

| Technologie | Version | Usage |
|-------------|---------|-------|
| Spring Boot | 3.x | Framework principal |
| Spring Data JPA | 3.x | Accès aux données |
| Hibernate | 6.x | ORM |
| MapStruct | 1.5+ | Mapping Entity/DTO |
| Lombok | 1.18+ | Réduction boilerplate |
| PostgreSQL | 15+ | Base de données |
| JUnit 5 | 5.x | Tests unitaires |
| Mockito | 5.x | Mocks pour tests |

---

## 📊 Base de données

### Tables principales

| Table | Description |
|-------|-------------|
| `department` | Départements de l'entreprise |
| `job` | Postes disponibles |
| `staffing_need` | 🆕 Besoins en personnel |
| `employee` | Employés |
| `contract` | Contrats de travail |
| `candidate` | Candidats |
| `publication` | Offres d'emploi |
| `application` | Candidatures |
| `interview` | Entretiens |
| `qcm` | Tests d'évaluation |

### Script d'initialisation

```bash
psql zentra < src/main/resources/sql/table_rh.sql
```

### Jeu de données (seed)

Un jeu de données PostgreSQL complet et cohérent est fourni ici :
- `src/main/resources/sql/all_entities_seed.sql`

Sous Windows (cmd.exe), exécutez :

```bat
set PGPASSWORD=YOUR_PASSWORD
psql -h localhost -U postgres -d zentra -f src/main/resources/sql/all_entities_seed.sql
```

Remarques :
- Le script est transactionnel (BEGIN/COMMIT) et idempotent (ON CONFLICT DO NOTHING sur les clés uniques usuelles).
- Les champs YearMonth (ex: `salary_advance.date`, `bonus.date`) sont stockés en texte au format `yyyy-MM` via un convertisseur JPA.

---

## 🎯 Exemples d'utilisation

### Créer un besoin en personnel

```bash
curl -X POST http://localhost:8080/api/staffing-needs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Développeur Full Stack",
    "numberOfPositions": 2,
    "priority": "High",
    "status": "Open",
    "departmentId": 1,
    "jobId": 3
  }'
```

### Lister tous les besoins

```bash
curl http://localhost:8080/api/staffing-needs
```

### Filtrer par statut

```bash
curl http://localhost:8080/api/staffing-needs/status/Open
```

---

## 🛠️ Configuration

### application.properties

```properties
# Application
spring.application.name=zentra-core

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/zentra
spring.datasource.username=postgres
spring.datasource.password=your_password

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Server
server.port=8080
server.servlet.context-path=/api
```

---

## 📈 Métriques du projet

| Métrique | Valeur |
|----------|--------|
| Endpoints REST | 9+ |
| Tests unitaires | 11+ |
| Tables DB | 13 |
| Fichiers Java | 50+ |
| Documentation | 6 fichiers |
| Build time | ~10s |
| Statut | ✅ Production Ready |

---

## 🎨 Fonctionnalités clés

### Validation robuste
- ✅ Vérification des données
- ✅ Contraintes métier
- ✅ Messages d'erreur clairs

### Audit automatique
- ✅ Timestamps (created_at, updated_at)
- ✅ Traçabilité des actions

### Gestion d'erreurs
- ✅ GlobalExceptionHandler
- ✅ Codes HTTP appropriés
- ✅ Messages JSON structurés

### Performance
- ✅ Lazy loading
- ✅ Transactions optimisées
- ✅ Index sur FK

---

## 🔧 Commandes utiles

```bash
# Compilation
./mvnw clean compile

# Tests
./mvnw test

# Package
./mvnw clean package

# Démarrage
./mvnw spring-boot:run

# Skip tests
./mvnw clean install -DskipTests
```

---

## 🐛 Résolution de problèmes

### La base de données ne se connecte pas
```bash
# Vérifier PostgreSQL
sudo systemctl status postgresql

# Vérifier les credentials
cat src/main/resources/application.properties
```

### Port 8080 déjà utilisé
Modifier dans `application.properties` :
```properties
server.port=8081
```

### Erreur MapStruct
```bash
./mvnw clean install -U
```

---

## 📞 Support

### Documentation
- 📘 [API Reference](./STAFFING_NEED_API.md)
- 📗 [Module Guide](./STAFFING_NEED_MODULE.md)
- 🚀 [Quick Start](./QUICK_START.md)

### Outils
- 🔧 [Postman Collection](./Zentra_Staffing_Needs_API.postman_collection.json)
- 🗄️ [SQL Scripts](./src/main/resources/sql/table_rh.sql)

---

## 🚀 Roadmap

### Phase actuelle (v1.0) ✅
- ✅ CRUD Besoins en personnel
- ✅ Filtres avancés
- ✅ Validation
- ✅ Tests
- ✅ Documentation

### Phase 2 (v1.1)
- [ ] Frontend React/Vue
- [ ] Spring Security
- [ ] Swagger UI
- [ ] Notifications email
- [ ] Dashboard analytics

### Phase 3 (v2.0)
- [ ] Workflow d'approbation
- [ ] Génération PDF
- [ ] Export Excel
- [ ] Intégration avec Publication
- [ ] Mobile app

---

## 👥 Équipe

**Zentra Development Team**

---

## 📄 Licence

Propriétaire - Pentagone Business

---

## 🎉 Changelog

### Version 1.0.0 (25 octobre 2025)
- ✅ Module Besoins en Personnel complet
- ✅ 9 endpoints REST
- ✅ Tests unitaires
- ✅ Documentation exhaustive
- ✅ Collection Postman
- ✅ Production Ready

---

## ✨ Conclusion

**Zentra Core** est une solution complète et moderne pour la gestion des ressources humaines. Le module de **Gestion des Besoins en Personnel** est prêt à l'emploi et peut être utilisé immédiatement en production.

---

**🚀 Bon développement avec Zentra !**

---

Pour plus d'informations, consultez le [PROJECT_COMPLETE.md](./PROJECT_COMPLETE.md).
