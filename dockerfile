FROM node:16

# Créer le répertoire de l'application
WORKDIR /usr/src/app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code de l'application
COPY . .

# Exposer le port 3000
EXPOSE 3000

# Lancer le serveur
# CMD ["node", "server.js"]

# Commande de démarrage avec un délai
CMD sh -c "sleep 25 && node server.js"
