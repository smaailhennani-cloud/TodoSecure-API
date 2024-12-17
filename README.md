# Serveur Node

## Description
API Node.js pour gérer les utilisateurs et les tâches.

---

## **Fonctionnalités**
- Création et authentification des utilisateurs.
- Gestion des tâches (CRUD : Create, Read, Update, Delete).
- Sécurité des routes via **JWT**.

---

## **Technologies utilisées**
- **Node.js** : Environnement d'exécution JavaScript.
- **Express.js** : Framework léger pour les APIs.
- **MySQL** : Base de données relationnelle.
- **bcrypt** : Hachage des mots de passe pour la sécurité.
- **JWT (jsonwebtoken)** : Authentification et gestion des sessions.
- **Docker** : Conteneurisation pour simplifier le déploiement.
- **dotenv** : Gestion des variables d'environnement.

---

## Installation

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/psnx340/test.git
   cd test
   ```

2. **Configurer l'environnement :**

   ```bash
   cp .env.example .env
   ```

3. **Lancer Docker :**
   ```bash
   docker build -t mon-projet-node .
   docker run -p 3000:3000 mon-projet-node
   ````

*** Routes disponibles : 
Utilisateurs: 
- POST /users : Ajouter un utilisateur, params : { "email": "string", "password": "string" }.
- POST /users/login : Connexion utilisateur (JWT).	params { "email": "string", "password": "string" }

Taches:
- GET /todos : Récupérer les tâches (JWT requis). params: ?userEmail=string (optionnel pour filtrer)
- POST /todos : Ajouter une tâche (JWT requis). params: { "title": "string", "description": "string", "userEmail": "string" }
- PUT	/todos/:id : Mettre à jour une tâche existante (JWT requis).	params : { "title": "string", "description": "string", "done": true/false }
- DELETE /todos/:id : Supprimer une tache (JWT requis). params : Aucun

