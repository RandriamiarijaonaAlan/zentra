# Guide de dépannage - Erreur 500 sur /leave-balances/employee/1/overview

## Problème identifié

L'erreur `500 (Internal Server Error)` sur l'endpoint `/leave-balances/employee/1/overview` est due au fait que le contrôleur `LeaveBalanceController` était vide ou mal configuré.

## Solutions appliquées

### 1. ✅ Contrôleur LeaveBalanceController créé/corrigé
- Contrôleur complet avec tous les endpoints nécessaires
- Gestion d'erreurs ajoutée
- Endpoint de test `/leave-balances/health` créé

### 2. ✅ Service mis à jour
- Méthode `getEmployeeLeaveOverview()` corrigée
- Auto-initialisation des balances si elles n'existent pas
- Transaction non-readonly pour permettre l'initialisation

### 3. ✅ Endpoints de diagnostic ajoutés
- `/health` - Santé générale de l'API
- `/health/leave-management` - Santé du module congés
- `/leave-balances/health` - Test spécifique du contrôleur
- `/leave-balances/employee/{id}/overview-simple` - Version simplifiée avec gestion d'erreurs

## Tests à effectuer (dans l'ordre)

### Étape 1: Redémarrer le serveur
```bash
# Arrêter le serveur Spring Boot
# Redémarrer avec mvn spring-boot:run
```

### Étape 2: Tests de base
```http
# Test 1: Santé générale
GET http://localhost:8080/health

# Test 2: Module congés disponible
GET http://localhost:8080/health/leave-management

# Test 3: Contrôleur Leave Balance
GET http://localhost:8080/leave-balances/health
```

### Étape 3: Test des données
```http
# Test 4: Employés existants
GET http://localhost:8080/employees

# Test 5: Types de congés
GET http://localhost:8080/leave-types
```

### Étape 4: Test progressif des balances
```http
# Test 6: Version simplifiée (avec diagnostic)
GET http://localhost:8080/leave-balances/employee/1/overview-simple

# Test 7: Initialisation forcée si nécessaire
POST http://localhost:8080/leave-balances/employee/1/initialize?year=2025

# Test 8: Overview complet
GET http://localhost:8080/leave-balances/employee/1/overview
```

## Vérifications supplémentaires si le problème persiste

### 1. Base de données
```sql
-- Vérifier les employés
SELECT * FROM employee LIMIT 5;

-- Vérifier les types de congés
SELECT * FROM leave_type WHERE is_active = true;

-- Vérifier les balances existantes
SELECT * FROM leave_balance WHERE employee_id = 1;
```

### 2. Logs du serveur
Rechercher dans les logs du serveur Spring Boot :
- Erreurs de mapping des entités
- Problèmes de transaction
- Erreurs SQL

### 3. Données de test
Si les données ne sont pas présentes, exécuter le script :
```sql
-- Utiliser le contenu de: src/main/resources/sql/all_entities_seed.sql
```

## Frontend - Correction en attente

Une fois le backend corrigé, le frontend devrait fonctionner automatiquement car :
- ✅ EmployeeSelector est déjà configuré
- ✅ LeaveDashboard utilise le bon endpoint
- ✅ Gestion d'erreurs en place

## Résolution attendue

Après redémarrage du serveur, l'endpoint `/leave-balances/employee/1/overview` devrait :
1. Répondre avec un code 200
2. Retourner un JSON contenant :
   - employeeId, employeeName, currentYear
   - leaveBalances (array)
   - recentRequests (array)
   - upcomingLeaves (array)

Si les balances n'existent pas, elles seront automatiquement initialisées.
