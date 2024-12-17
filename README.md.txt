# Serveur Node

## Description
API Node.js pour gérer les utilisateurs et les tâches.

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
- POST /users : Ajouter un utilisateur.
- POST /users/login : Connexion utilisateur.
- GET /todos : Récupérer les tâches (JWT requis).
- POST /todos : Ajouter une tâche (JWT requis).