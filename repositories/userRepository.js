const db = require('../database.db');


/**
 * Récupère un utilisateur par email
 * @param {string} email
 * @returns {Promise<Object|undefined>} L'utilisateur ou undefined s'il n'est pas trouvé
 */
exports.getByEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
};

/**
 * Crée un nouvel utilisateur
 * @param {string} email
 * @param {string} hashedPassword
 * @returns {Promise<number>} ID de l'utilisateur créé
 */
exports.createUser = (email, hashedPassword) => {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, password], (err, results) => {
            if (err) return reject(err);
            resolve(results.insertId);
        });
    });
};

/**
 * Récupère tous les utilisateurs
 * @returns {Promise<Array>} Liste des utilisateurs
 */
exports.getAllUsers = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM users', (err, results) => {
           if (err) return reject(err); 
           resolve(results);
        });
    })
}