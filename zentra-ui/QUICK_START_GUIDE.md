# 🚀 ZENTRA - GUIDE DE DÉMARRAGE RAPIDE

---

## ⚡ Démarrage en 5 Minutes

### Étape 1: Base de Données (2 min)

```bash
# Ouvrir MySQL
mysql -u root -p

# Créer la base
CREATE DATABASE IF NOT EXISTS zentra_db;
USE zentra_db;

# Exécuter le script
SOURCE E:/Projects/Multi-tech/zentra/zentra-core/src/main/resources/sql/leave_management_schema.sql;

# Vérifier
SHOW TABLES;
```

**Résultat attendu**:
```
+------------------------+
| Tables_in_zentra_db    |
+------------------------+
| leave_balance          |
| leave_notification     |
| leave_request          |
| leave_type             |
| employee               |
+------------------------+
```

---

### Étape 2: Backend (1 min)

```bash
# Aller dans zentra-core
cd E:/Projects/Multi-tech/zentra/zentra-core

# Lancer
mvnw.cmd spring-boot:run
```

**Vérifier que le serveur démarre**:
```
✅ Tomcat started on port(s): 8080
✅ Started ZentraCoreApplication
```

---

### Étape 3: Frontend (2 min)

```bash
# Aller dans zentra-ui
cd E:/Projects/Multi-tech/zentra/zentra-ui

# Installer (si première fois)
npm install

# Lancer
npm run dev
```

**Ouvrir le navigateur**:
```
http://localhost:5173/admin/leaves/dashboard
```

---

## 🎯 Test Rapide (30 secondes)

### 1. Sélectionner un Employé
```
👤 Cliquez sur le dropdown "Employé sélectionné"
✅ Choisissez "Jean Dupont"
```

### 2. Voir le Dashboard
```
📊 Soldes de congés s'affichent
🔔 Notifications apparaissent
📋 Demandes récentes visibles
```

### 3. Changer d'Employé
```
👤 Cliquez à nouveau sur le dropdown
✅ Choisissez "Marie Martin"
🔄 Les données se rechargent automatiquement
```

---

## 📱 Interface Visuelle

### Dashboard
```
┌──────────────────────────────────────────────────────┐
│  📅 Mon Tableau de Bord Congés    [Nouvelle demande] │
├──────────────────────────────────────────────────────┤
│  👤 Employé sélectionné: [Jean Dupont ▼]            │
│                          jean.dupont@zentra.com      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  🔔 Notifications récentes (2)                      │
│  ├─ Demande approuvée - CP du 20/11 au 25/11       │
│  └─ Solde mis à jour - RTT: 5 jours restants       │
│                                                      │
│  💼 Mes Soldes de Congés (2025)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │     25      │  │      5      │  │      3      │ │
│  │ Congés Payés│  │     RTT     │  │   Maladie   │ │
│  │ / 25 jours  │  │  / 10 jours │  │  / illimité │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                      │
│  📋 Mes Demandes Récentes                           │
│  ├─ 01/11-05/11 | CP      | 5j | ✅ Approuvé      │
│  ├─ 20/11-22/11 | CP      | 3j | ⏰ En attente    │
│  └─ 01/12-15/12 | CP      | 10j| ⏰ En attente    │
│                                                      │
│  🗓️  Mes Congés à Venir                            │
│  └─ 20/11 - 22/11 (3 jours) - Dans 4 jours         │
└──────────────────────────────────────────────────────┘
```

---

## 🔄 Navigation Rapide

### Depuis le Sidebar
```
📊 Dashboard
📝 QCM
👥 Entretiens
📰 Publications
👤 Candidatures
🎯 Besoins
📅 Congés ⭐
  ├─ 📊 Tableau de bord       ← Vous êtes ici
  ├─ 📋 Types de congés
  ├─ 📝 Mes demandes
  ├─ ⏰ Demandes en attente
  └─ 🗓️  Calendrier
```

---

## ⚙️ Fonctionnalités Disponibles

### ✅ Opérations Employé

1. **Voir son Dashboard**
   ```
   /admin/leaves/dashboard
   ```

2. **Créer une Demande**
   ```
   Dashboard → [Nouvelle demande]
   ou
   Sidebar → Congés → Mes demandes → [+]
   ```

3. **Voir le Calendrier**
   ```
   Sidebar → Congés → Calendrier
   ```

### ✅ Opérations Manager

1. **Voir Demandes en Attente**
   ```
   Sidebar → Congés → Demandes en attente
   ```

2. **Approuver/Rejeter**
   ```
   Demandes en attente → [Approuver] sur une ligne
   ```

### ✅ Opérations RH

1. **Gérer les Types**
   ```
   Sidebar → Congés → Types de congés
   ```

2. **Créer un Type**
   ```
   Types de congés → [Nouveau Type]
   ```

---

## 🐛 Dépannage Express

### Problème: Backend ne démarre pas
```bash
# Vérifier Java
java -version  # Doit afficher Java 17+

# Nettoyer et relancer
mvnw.cmd clean
mvnw.cmd spring-boot:run
```

### Problème: Frontend erreur 404
```bash
# Vérifier que le backend tourne
curl http://localhost:8080/api/leave-types

# Si erreur, backend pas démarré
```

### Problème: Pas d'employés dans le dropdown
```
✅ C'est NORMAL !
✅ Les employés de test s'affichent automatiquement
✅ 5 employés prêts à l'emploi:
   1. Jean Dupont
   2. Marie Martin
   3. Pierre Lefebvre
   4. Sophie Bernard
   5. Lucas Moreau
```

### Problème: Données ne se chargent pas
```bash
# Vérifier la console navigateur (F12)
# Vérifier la console backend

# Erreur 404 → Endpoint manquant
# Erreur 500 → Problème backend
# Erreur réseau → Backend pas lancé
```

---

## 📊 Données de Test

### Si vous voulez tester rapidement, insérez:

```sql
-- Type de congé
INSERT INTO leave_type (id, name, description, is_paid, max_days_per_year, requires_approval, is_active, color)
VALUES 
(1, 'Congés Payés', 'Congés annuels payés', true, 25, true, true, '#007bff'),
(2, 'RTT', 'Réduction du temps de travail', true, 10, true, true, '#28a745'),
(3, 'Congés Maladie', 'Arrêt maladie', true, NULL, false, true, '#ffc107');

-- Balance (si vous avez un employee avec id=1)
INSERT INTO leave_balance (id, employee_id, leave_type_id, year, allocated_days, used_days, pending_days, carried_over_days)
VALUES 
(1, 1, 1, 2025, 25.0, 5.0, 3.0, 0.0),
(2, 1, 2, 2025, 10.0, 2.0, 0.0, 0.0),
(3, 1, 3, 2025, 0.0, 0.0, 0.0, 0.0);
```

---

## ✅ Checklist de Vérification

Cochez quand c'est fait:

### Backend
- [ ] MySQL installé et démarré
- [ ] Base `zentra_db` créée
- [ ] Script SQL exécuté
- [ ] Tables visibles (`SHOW TABLES;`)
- [ ] Backend lance sans erreur
- [ ] Port 8080 répond

### Frontend
- [ ] Node.js installé (v16+)
- [ ] `npm install` réussi
- [ ] `npm run dev` lance sans erreur
- [ ] Port 5173 ouvert dans le navigateur
- [ ] Page s'affiche correctement

### Fonctionnel
- [ ] Dropdown employés fonctionne
- [ ] Changement d'employé recharge les données
- [ ] Dashboard affiche les soldes
- [ ] Navigation sidebar fonctionne
- [ ] Calendrier s'affiche correctement

---

## 🎯 Prochaines Actions

Une fois tout vérifié:

1. **Tester la création de demande**
   ```
   Dashboard → Nouvelle demande → Remplir → Soumettre
   ```

2. **Tester le calendrier**
   ```
   Sidebar → Calendrier → Navigation ← →
   ```

3. **Tester les types**
   ```
   Sidebar → Types de congés → Créer
   ```

4. **Tester l'approbation**
   ```
   Créer demande → Voir en attente → Approuver
   ```

---

## 🎉 C'EST PARTI !

Vous êtes maintenant prêt à utiliser le **Module de Gestion des Congés** !

```
✅ Backend: RUNNING
✅ Frontend: RUNNING
✅ Database: READY
✅ Module: OPERATIONAL

🚀 Bon développement avec Zentra !
```

---

**Besoin d'aide?** Consultez `FINAL_COMPLETE_SUMMARY.md` pour la documentation complète.

