const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

if (process.env.DATABASE_URL) {
  const dbConfig = {
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true },
    multipleStatements: true
  };
} else {
  dbConfig = {
    host: process.env.DB_HOST || 'mysql',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'adminpassword',
    database: process.env.DB_NAME || 'tododb',
    multipleStatements: true
  };
}

let connection;

function handleDisconnect() {
  connection = mysql.createConnection(dbConfig);

  connection.connect(err => {
    if (err) {
      console.error('Erreur de connexion MySQL :', err.message);
      setTimeout(handleDisconnect, 5000); // Tente de se reconnecter après 5 secondes
    } else {
      console.log('Connecté à MySQL');

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

  connection.on('error', err => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.warn('Connexion MySQL perdue. Tentative de reconnexion...');
      handleDisconnect(); // Relance la connexion
    } else {
      throw err;
    }
  });
}

handleDisconnect();

module.exports = connection;
