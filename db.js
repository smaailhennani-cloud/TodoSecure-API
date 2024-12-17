const mysql = require('mysql2');

// Configuration de la base de données
const dbConfig = {
  uri: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true },
};

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
