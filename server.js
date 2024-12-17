const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const allowedOrigins = ['http://localhost:4200', 'https://gylgamesh34.github.io'];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

const users = [
    { email: 'test@gmail.com', password: 'test' },
    { email: 'test1@gmail.com', password: 'test1' },
    { email: 'test2@gmail.com', password: 'test2' },
];

let hashedUsers = [];

async function hashUserPasswords(users) {
    return Promise.all(
        users.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            return `('${user.email}', '${hashedPassword}')`;
        })
    );
}

async function initializeHashedUsers() {
    try {
        hashedUsers = await hashUserPasswords(users);
        console.log("Utilisateurs hachés :", hashedUsers);
    } catch (error) {
        console.error("Erreur lors de l'initialisation des utilisateurs hachés :", error);
    }
}

function createDatabaseConnection() {
    const db = mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: true },
    });

    db.connect((err) => {
        if (err) {
            console.error('Erreur de connexion MySQL :', err);
            setTimeout(createDatabaseConnection, 5000); // Reconnexion après 5 secondes
        } else {
            console.log('Connecté à MySQL');
        }
    });

    db.on('error', (err) => {
        console.error('Erreur MySQL détectée :', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('Reconnexion à MySQL...');
            setTimeout(createDatabaseConnection, 5000); // Reconnexion après 5 secondes
        } else {
            throw err;
        }
    });

    return db;
}

function setupDatabase(db) {
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
        ${hashedUsers.join(',\n')};

        INSERT IGNORE INTO todos (userEmail, title, description, done) VALUES
        ('test@gmail.com', 'Acheter des courses', 'Acheter du lait, du pain et des œufs', FALSE),
        ('test1@gmail.com', 'Faire du sport', 'Courir 5 km ce soir', TRUE),
        ('test1@gmail.com', 'Révision', 'Revoir le chapitre 3 de maths', FALSE),
        ('test2@gmail.com', 'Préparer une réunion', 'Créer une présentation PowerPoint', TRUE);
    `;

    const commands = sqlScript.split(';').filter(cmd => cmd.trim());
    commands.forEach(command => {
        db.query(command, (err) => {
            if (err) console.error('Erreur SQL :', command, err.message);
        });
    });
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token manquant.' });
    }

    jwt.verify(token, 'votre_clé_secrète', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide ou expiré.' });
        }
        req.user = user;
        next();
    });
}

app.use('/todos', authenticateToken);

app.get('/todos', (req, res) => {
    const { userEmail } = req.query;
    const db = createDatabaseConnection();

    const query = userEmail
        ? 'SELECT * FROM todos WHERE userEmail = ?'
        : 'SELECT * FROM todos';

    db.query(query, userEmail ? [userEmail] : [], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur', error: err });
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
        const { title, description, done } = req.body;

        console.log('Données reçues :', { title, description, done }); // Log des données reçues

        db.query(
            'UPDATE todos SET title = ?, description = ?, done = ? WHERE id = ?',
            [title, description, done, todoId],
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

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const db = createDatabaseConnection();

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur' });
        if (results.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });

        const token = jwt.sign({ email: user.email }, 'votre_clé_secrète', { expiresIn: '1h' });
        res.json({ token });
    });
});

app.post('/users', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });

    const db = createDatabaseConnection();

    db.query('SELECT email FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur.' });
        if (results.length > 0) return res.status(400).json({ error: 'Email déjà utilisé.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err) => {
            if (err) return res.status(500).json({ error: 'Erreur lors de l’ajout.' });
            res.status(201).json({ message: 'Utilisateur ajouté.' });
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur http://localhost:${PORT}`);

    initializeHashedUsers().then(() => {
        const db = createDatabaseConnection();
        setupDatabase(db);
    });
});
