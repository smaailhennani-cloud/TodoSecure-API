# API de Gestion des Tâches Node.js

## Description
API RESTful Node.js dédiée à la gestion efficace des utilisateurs et des tâches, intégrant une sécurité avancée et un déploiement avec Docker.

---

## **Fonctionnalités**
- **Gestion des utilisateurs** :
  - Inscription sécurisée des utilisateurs.
  - Authentification via JSON Web Tokens (JWT).

- **Gestion des tâches (Opérations CRUD)** :
  - Création, lecture, mise à jour et suppression des tâches.
  - Filtrage des tâches par email utilisateur.

- **Sécurité** :
  - Chiffrement des mots de passe avec `bcrypt`.
  - Sécurisation des routes grâce à l'authentification JWT.

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

## Installation & Configuration

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/smaailhennani-cloud/TodoSecure-API.git
   cd test
   ```

2. **Configurer l'environnement :**

   ```bash
   cp .env.example .env
   # Modifier le fichier .env avec les paramètres de votre base de données et de votre application
   ```

3. **Déploiement avec Docker :**
   Construire et exécuter le conteneur Docker :
   ```bash
   docker build -t mon-projet-node .
   docker run -p 3000:3000 mon-projet-node
   ````
Votre application sera accessible à l'adresse : http://localhost:3000

*** Endpoints de l'API : 
Utilisateurs: 
- POST /users : Ajouter un utilisateur, params : { "email": "utilisateur@example.com", "password": "motdepasse" }.
- POST /login : Connexion utilisateur (JWT).	params { "email": "utilisateur@example.com", "password": "motdepasse" }

Taches:
- GET /todos : Récupérer les tâches (JWT requis). params: ?userEmail=utilisateur@example.com (optionnel pour filtrer)
- POST /todos : Ajouter une tâche (JWT requis). params: { "title": "Titre de la tâche", "description": "Description de la tâche", "userEmail": "utilisateur@example.com" }
- PUT	/todos/:id : Mettre à jour une tâche existante (JWT requis).	params : { "title": "Titre modifié", "description": "Description modifiée", "done": true/false }
- DELETE /todos/:id : Supprimer une tache (JWT requis). params : Aucun

## Licence
Ce projet est disponible sous licence MIT. Voir le fichier LICENSE pour plus d'informations.
