const express = require('express');
const mysql = require('mysql2/promise');
const fs = require('fs'); // Ajout pour lire le fichier SQL
const path = require('path'); // Import pour manipuler les chemins de fichiers
const app = express();

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

const handleDisconnect = async () => {
    // Configurer la connexion MySQL
    const db = mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: true, // Valide les certificats SSL
        },
    });
    // Chargez le script SQL
    const initScript = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');
    await db.query(initScript);
    console.log('Tables créées avec succès.');
    await db.end();



    db.connect((err) => {
        if (err) {
            console.error('Erreur de connexion MySQL :', err);
            setTimeout(handleDisconnect, 5000); // Reconnexion après 5 secondes
        } else {
            console.log('Connecté à MySQL');
            // Initialisation de la base de données avec init.sql
            const initScript = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');
            db.query(initScript, (err) => {
                if (err) {
                    console.error('Erreur lors de l\'initialisation de la base de données :', err);
                } else {
                    console.log('Tables créées avec succès.');
                }
            });
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

    // Authentification utilisateur
    app.post('/login', (req, res) => {
        const { email } = req.body;
        // Log des données reçues
        console.log('Email reçu :', email);

        if (!email) {
            return res.status(400).json({ message: 'Email manquant dans la requête' });
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
            if (err) return res.status(500).send(err);
                if (results.length === 0) {
                    return res.status(401).json({ message: 'Utilisateur non trouvé' });
                }

            // Réponse si l'utilisateur est trouvé
            const user = results[0];
            return res.json({ message: 'Utilisateur trouvé', user });
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
