const express = require('express');
const mysql = require('mysql2');
const fs = require('fs'); // Ajout pour lire le fichier SQL
const path = require('path'); // Import pour manipuler les chemins de fichiers
const app = express();
const cors = require('cors');

// Configuration CORS
const corsOptions = {
    origin: 'http://localhost:4200', // Remplacez par les origines autorisées
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes HTTP autorisées
    allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisés
};

// Activer le middleware CORS
app.use(cors(corsOptions));

process.on('uncaughtException', (err) => {
    console.error('Erreur non gérée :', err);
    process.exit(1); // Arrête l'application proprement
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Rejet non géré à :', promise, 'raison :', reason);
});

console.log('Lancement de l\'application...'); 

// Configurer le middleware pour gérer les requêtes JSON
app.use(express.json());

const handleDisconnect = () => {
    // Configurer la connexion MySQL
    const db = mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: true, // Valide les certificats SSL
        },
    });
    // Chargez le script SQL
    const initScript = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');
    console.log("Exécution du script SQL : ", initScript);

    const sqlScript = `
    DROP TABLE IF EXISTS todos;
    DROP TABLE IF EXISTS users;
    
    CREATE TABLE IF NOT EXISTS users (
        email VARCHAR(255) NOT NULL PRIMARY KEY,
        password VARCHAR(255) NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userEmail VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        done BOOLEAN DEFAULT FALSE,
        CONSTRAINT fk_user FOREIGN KEY (userEmail) REFERENCES users(email) ON DELETE CASCADE
    );
    
    INSERT IGNORE INTO users (email, password) VALUES
    ('test@gmail.com', 'test'),
    ('test1@gmail.com', 'test1'),
    ('test2@gmail.com', 'test2');
    
    INSERT IGNORE INTO todos (userEmail, title, description, done) VALUES
    ('test@gmail.com', 'Acheter des courses', 'Acheter du lait, du pain et des œufs', FALSE),
    ('test1@gmail.com', 'Faire du sport', 'Courir 5 km ce soir', TRUE),
    ('test1@gmail.com', 'Révision', 'Revoir le chapitre 3 de maths', FALSE),
    ('test2@gmail.com', 'Préparer une réunion', 'Créer une présentation PowerPoint', TRUE);
    `;

    const sqlCommands = sqlScript.split(';').filter((cmd) => cmd.trim().length > 0); // Diviser le script en commandes

    sqlCommands.forEach((command) => {
        db.query(command, (err, result) => {
            if (err) {
                console.error('Erreur SQL détectée :', command);
                console.error('Détails de l\'erreur :', err.message);
            } else {
                console.log('Commande exécutée avec succès :', command);
            }
        });
    });

    /*
    db.query(sqlScript, (err, results) => {
        if (err) {
            console.error('Erreur lors de l\'exécution de la commande SQL suivante :');
            console.error(sqlScript); // Affiche le script complet
            console.error('Détails de l\'erreur :', err);
        } else {
            console.log('Tables créées avec succès.');
        }
    });
    */
    // console.log('Tables créées avec succès.');
    // await db.end();



    db.connect((err) => {
        if (err) {
            console.error('Erreur de connexion MySQL :', err);
            setTimeout(handleDisconnect, 5000); // Reconnexion après 5 secondes
        } else {
            console.log('Connecté à MySQL');
            // Initialisation de la base de données avec init.sql
            const initScript = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');
            console.log("Exécution du script SQL : ", initScript);
            /*
            db.query(sqlScript, (err, results) => {
                if (err) {
                    console.error('Erreur lors de l\'initialisation de la base de données :');
                    console.error('Message:', err.message);
                    console.error('Code:', err.code);
                    console.error('SQL State:', err.sqlState);
                    console.error('SQL Query:', err.sql);
                } else {
                    console.log('Tables créées avec succès.');
                }
            });
            */
        }
    });

    db.on('error', (err) => {
        console.error('Erreur MySQL détectée :', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('Reconnexion à MySQL...');
            handleDisconnect(); // Reconnecter automatiquement
        } else {
            throw err; // Lever l'erreur pour une gestion ultérieure
        }
    });


    // Exemple d'endpoint : récupérer tous les todos
    app.get('/todos', (req, res) => {
        db.query('SELECT * FROM todos', (err, results) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json(results);
            }
        });
    });

    // Authentification utilisateur via un paramètre dans l'URL
    app.get('/login/:email', (req, res) => {
        const email = req.params.email; // Récupération de l'email depuis l'URL
    
        console.log('Email reçu depuis l\'URL :', email);
    
        if (!email) {
            return res.status(400).json({ message: 'Email manquant dans l\'URL' });
        }
    
        // Requête SQL pour trouver l'utilisateur par email
        db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
            if (err) {
                console.error('Erreur lors de la requête SQL :', err);
                return res.status(500).json({ message: 'Erreur serveur' });
            }
    
            if (results.length === 0) {
                return res.status(404).json({ message: 'Utilisateur non trouvé' });
            }
    
            const user = results[0];
            res.status(200).json({
                email: user.email,
                password: user.password, // Inclure le mot de passe
            });
        });
    });

    // Ajouter un nouvel utilisateur
    app.post('/users', (req, res) => {
        const { email, password } = req.body; // Ajouter des champs si nécessaire
        db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, password], (err, results) => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'Utilisateur ajouté avec succès', userId: results.insertId });
        });
    });

    // Récupérer tous les utilisateurs
    app.get('/users', (req, res) => {
        db.query('SELECT * FROM users', (err, results) => {
            if (err) return res.status(500).send(err);
            res.json(results);
        });
    });

    // Ajouter une nouvelle tâche
    app.post('/todos', (req, res) => {
        const { title, description, userEmail } = req.body;
        db.query(
            'INSERT INTO todos (title, description, userEmail) VALUES (?, ?, ?)',
            [title, description, userEmail],
            (err, results) => {
                if (err) return res.status(500).send(err);
                res.json({ message: 'Todo ajouté avec succès', todoId: results.insertId });
            }
        );
    });

    // Récupérer les tâches par utilisateur
    app.get('/todos/:email', (req, res) => {
        const email = req.params.email;
        console.log('Email reçu depuis l\'URL pour la requete todos :', email);
        db.query('SELECT * FROM todos WHERE userEmail = ?', [email], (err, results) => {
            if (err) return res.status(500).send(err);
            res.json(results);
        });
    });

    // Mettre à jour une tâche
    app.put('/todos/:id', (req, res) => {
        const todoId = req.params.id;
        const { title, description } = req.body;
        db.query(
            'UPDATE todos SET title = ?, description = ? WHERE id = ?',
            [title, description, todoId],
            (err, results) => {
                if (err) return res.status(500).send(err);
                res.json({ message: 'Todo mis à jour avec succès' });
            }
        );
    });

    // Supprimer une tâche
    app.delete('/todos/:id', (req, res) => {
        const todoId = req.params.id;
        db.query('DELETE FROM todos WHERE id = ?', [todoId], (err, results) => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'Todo supprimé avec succès' });
        });
    });

    // Démarrer le serveur
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`API en écoute sur http://localhost:${PORT}`);
    });
    process.on('SIGTERM', () => {
        console.log('Signal SIGTERM reçu. Fermeture du serveur...');
        process.exit(0);
    });

    process.on('SIGINT', () => {
        console.log('Signal SIGINT reçu. Fermeture du serveur...');
        process.exit(0);
    });

};

handleDisconnect();
