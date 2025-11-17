# 📍 OÙ SÉLECTIONNER UN EMPLOYÉ ?

## 🎯 Le sélecteur d'employé apparaît sur 3 pages :

---

## 1️⃣ TABLEAU DE BORD DES CONGÉS

**URL**: `http://localhost:5173/admin/leaves/dashboard`

**Accès**:
- Dashboard → Clic sur "Gestion des Congés"
- OU Menu latéral → Congés → Tableau de bord

**Sélecteur** :
```
┌────────────────────────────────────────────────────────┐
│  Mon Tableau de Bord Congés          [Nouvelle demande]│
├────────────────────────────────────────────────────────┤
│                                                        │
│  👤 Employé sélectionné: [Jean Dupont            ▼]   │ ← ICI !
│                          jean.dupont@zentra.com       │
│                                                        │
├────────────────────────────────────────────────────────┤
│  🔔 Notifications récentes                            │
│  💼 Mes Soldes de Congés (2025)                       │
│  📋 Mes Demandes Récentes                             │
└────────────────────────────────────────────────────────┘
```

**Action** :
- Cliquez sur le dropdown "Jean Dupont ▼"
- Choisissez un employé dans la liste
- Le tableau de bord se recharge automatiquement avec les données du nouvel employé

---

## 2️⃣ NOUVELLE DEMANDE DE CONGÉ

**URL**: `http://localhost:5173/admin/leaves/requests/new`

**Accès**:
- Menu latéral → Congés → Mes demandes → Bouton "Nouvelle Demande"
- OU Dashboard congés → Bouton "Nouvelle demande"

**Sélecteur** :
```
┌────────────────────────────────────────────────────────┐
│  Nouvelle Demande de Congé                  [Annuler]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  👤 Employé sélectionné: [Marie Martin           ▼]   │ ← ICI !
│                          marie.martin@zentra.com      │
│                                                        │
├────────────────────────────────────────────────────────┤
│  📝 Formulaire de demande                             │
│  Type de congé: [Congés payés        ▼]              │
│  Date de début: [___________]                         │
│  Date de fin:   [___________]                         │
└────────────────────────────────────────────────────────┘
```

**Action** :
- Cliquez sur le dropdown
- Choisissez l'employé pour qui créer la demande
- Les soldes de congés disponibles se mettent à jour
- Remplissez le formulaire et soumettez

---

## 3️⃣ APPROBATION DE DEMANDE

**URL**: `http://localhost:5173/admin/leaves/requests/:id/approve`

**Accès**:
- Menu latéral → Congés → Demandes en attente
- Clic sur le bouton "Approuver" d'une demande

**Sélecteur** :
```
┌────────────────────────────────────────────────────────┐
│  Approbation de Demande de Congé    [Retour à la liste]│
├────────────────────────────────────────────────────────┤
│                                                        │
│  👤 Manager: [Sophie Bernard                     ▼]   │ ← ICI !
│              sophie.bernard@zentra.com                │
│                                                        │
├────────────────────────────────────────────────────────┤
│  📄 Détails de la demande                             │
│  Employé: Jean Dupont                                 │
│  Type: Congés payés                                   │
│  Période: 01/12/2025 - 05/12/2025                     │
│                                                        │
│  ✅ Approuver        ❌ Rejeter                        │
└────────────────────────────────────────────────────────┘
```

**Action** :
- Cliquez sur le dropdown
- Choisissez qui est le manager qui approuve/rejette
- Prenez votre décision
- L'action est enregistrée avec l'ID du manager sélectionné

---

## 🎨 COMMENT UTILISER LE SÉLECTEUR

### Étape 1 : Voir la liste

Cliquez sur le bouton du sélecteur :
```
┌────────────────────────────────────────────┐
│  Jean Dupont                           ▼   │ ← Cliquer ici
│  jean.dupont@zentra.com                    │
└────────────────────────────────────────────┘
```

### Étape 2 : Le dropdown s'ouvre

```
┌────────────────────────────────────────────┐
│  Jean Dupont                           ✓   │ ← Sélectionné actuellement
│  jean.dupont@zentra.com                    │
├────────────────────────────────────────────┤
│  Marie Martin                              │ ← Cliquer pour choisir
│  marie.martin@zentra.com                   │
├────────────────────────────────────────────┤
│  Pierre Lefebvre                           │
│  pierre.lefebvre@zentra.com                │
├────────────────────────────────────────────┤
│  Sophie Bernard                            │
│  sophie.bernard@zentra.com                 │
├────────────────────────────────────────────┤
│  Lucas Moreau                              │
│  lucas.moreau@zentra.com                   │
└────────────────────────────────────────────┘
```

### Étape 3 : Sélectionnez un employé

Cliquez sur n'importe quel nom dans la liste.

### Étape 4 : La page se met à jour

Les données se rechargent automatiquement pour l'employé sélectionné !

---

## 🔄 QUE SE PASSE-T-IL APRÈS ?

### Sur le Dashboard
- ✅ Les soldes de congés changent
- ✅ Les notifications changent
- ✅ Les demandes récentes changent
- ✅ Les congés à venir changent

### Sur le Formulaire
- ✅ Les soldes disponibles se mettent à jour
- ✅ La validation vérifie le bon compte
- ✅ La demande est créée pour le bon employé

### Sur l'Approbation
- ✅ L'approbation/rejet est enregistrée avec le bon manager

---

## 📍 NAVIGATION COMPLÈTE

### Depuis le Dashboard Principal

1. **Cliquer sur la carte "Gestion des Congés"**
   ```
   ┌──────────────┐
   │   📅         │
   │   Congés     │  ← Cliquer ici
   │              │
   └──────────────┘
   ```

2. **Vous arrivez sur le Dashboard Congés**
   - Le sélecteur d'employé est visible en haut
   - Par défaut: "Jean Dupont (ID: 1)"

3. **Changez d'employé si besoin**
   - Cliquez sur le dropdown
   - Choisissez l'employé voulu

### Depuis le Menu Latéral

1. **Cliquez sur "Congés" dans le menu**
   ```
   ║  📅 Congés                      ▼    ║
   ║     └─ 📊 Tableau de bord            ║ ← Cliquer ici
   ║     └─ 📋 Types de congés            ║
   ║     └─ 📝 Mes demandes               ║
   ```

2. **Vous arrivez sur la page choisie**
   - Sélecteur visible sur Dashboard, Nouvelle demande, Approbation

---

## 💡 EMPLOYÉS DISPONIBLES

Si votre API `/employees` ne fonctionne pas encore, 5 employés de test sont disponibles :

1. **Jean Dupont** (ID: 1)
   - jean.dupont@zentra.com

2. **Marie Martin** (ID: 2)
   - marie.martin@zentra.com

3. **Pierre Lefebvre** (ID: 3)
   - pierre.lefebvre@zentra.com

4. **Sophie Bernard** (ID: 4)
   - sophie.bernard@zentra.com

5. **Lucas Moreau** (ID: 5)
   - lucas.moreau@zentra.com

---

## 🎯 RÉSUMÉ VISUEL

```
                    DASHBOARD PRINCIPAL
                            │
                            ▼
                ┌───────────────────────┐
                │  Clic sur "Congés"    │
                └───────────────────────┘
                            │
                            ▼
              ┌─────────────────────────────┐
              │  DASHBOARD CONGÉS           │
              ├─────────────────────────────┤
              │  👤 Sélecteur ← VISIBLE ICI │
              └─────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    [Nouvelle demande] [Calendrier] [Types]
            │
            ▼
    ┌─────────────────────────┐
    │  FORMULAIRE DEMANDE     │
    ├─────────────────────────┤
    │  👤 Sélecteur ← ICI     │
    └─────────────────────────┘
```

---

## ✅ POUR TESTER

1. Lancez l'application :
   ```bash
   cd zentra-ui
   npm run dev
   ```

2. Ouvrez : `http://localhost:5173/admin/leaves/dashboard`

3. Vous devriez voir :
   - Le titre "Mon Tableau de Bord Congés"
   - **Le sélecteur d'employé juste en dessous** avec "Jean Dupont" par défaut
   - Les soldes de congés pour Jean

4. Cliquez sur le dropdown et changez d'employé

5. Observez que tout se recharge !

---

## 🎊 C'EST TOUT !

Le sélecteur d'employé est **toujours visible** sur les 3 pages principales du module congés. Vous n'avez **rien à configurer**, il est déjà là et fonctionnel !

**Allez-y, testez !** 🚀

