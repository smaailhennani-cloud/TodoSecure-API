const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

// Configuration de la base de données avec scalingo
if (process.env.DATABASE_URL) {
  const dbConfig = {
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true },
    multipleStatements: true
  };
} else {
  // Configuration locale : connexion vers le conteneur MySQL (nommé "mysql" dans docker-compose)
  dbConfig = {
    host: process.env.DB_HOST || 'mysql',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'adminpassword',
    database: process.env.DB_NAME || 'tododb',
    multipleStatements: true
  };
  console.log("Utilisation de la configuration locale pour la connexion MySQL");
}

let connection;

// Fonction pour établir et gérer la reconnexion
function handleDisconnect() {
  connection = mysql.createConnection(dbConfig);

  connection.connect(err => {
    if (err) {
      console.error('Erreur de connexion MySQL :', err.message);
      setTimeout(handleDisconnect, 5000); // Tente de se reconnecter après 5 secondes
    } else {
      console.log('Connecté à MySQL');
      // Lecture et exécution du script SQL pour créer les tables
      fs.readFile(path.join(__dirname, 'init.sql'), 'utf8', (err, data) => {
        if (err) {
          console.error("Erreur de lecture du fichier SQL :", err);
        } else {
          connection.query(data, (err, results) => {
            if (err) {
              console.error("Erreur lors de l'exécution du script SQL :", err);
            } else {
              console.log("Script SQL exécuté avec succès, tables créées ou mises à jour.");
            }
          });
        }
      });
    }
  });

  // Gérer les erreurs de la connexion
  connection.on('error', err => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.warn('Connexion MySQL perdue. Tentative de reconnexion...');
      handleDisconnect(); // Relance la connexion
    } else {
      throw err;
    }
  });
}

// Initialisation de la connexion
handleDisconnect();

// Exporter la connexion pour l'utiliser dans les autres modules
module.exports = connection;
