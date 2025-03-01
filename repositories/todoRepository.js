const e = require('express');
const db = require('../database/db');

/**
 * Récupère les tâches
 * @returns {Promise<Array>} Liste de tâches
 */
exports.getTodos = () => {
    return new Promise((resolve, reject) => {
        let query = 'SELECT * FROM todos';
        db.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

/**
 * Récupère les tâches d'un utilisateur spécifique
 * @param {string} email - Email de l'utilisateur
 * @returns {Promise<Array>} Liste de tâches
 */
exports.getTodosByEmail = (userEmail) => {
    return new Promise((resolve, reject) => 
    db.query('SELECT * FROM todos WHERE userEmail = ?', [userEmail], (err, results) => {
        if (err) return reject(err);
        resolve(results);
    }))
}

/**
 * Crée une nouvelle tâche
 * @param {string} title
 * @param {string} description
 * @param {string} userEmail
 * @returns {Promise<number>} ID de la tâche créée
 */
exports.createTodo = (title, description, userEmail) => {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO todos (title, description, userEmail) VALUES (?, ?, ?)',
            [title, description, userEmail], (err, results) => {
                if (err) return reject(err);
                resolve(results.insertID);
            }
        );
    });
};

/**
 * Met à jour une tâche
 * @param {number} id - ID de la tâche
 * @param {string} title - Nouveau titre
 * @param {string} description - Nouvelle description
 * @param {boolean} done - Statut de la tâche
 * @returns {Promise<void>}
 */
exports.updateTodo = (id, title, description, done) => {
    return new Promise((resolve, reject) => {
        db.query('UPDATE todos SET title = ?, description = ?, done = ? WHERE id = ?',
            [title, description, done, id],
            (err) => {
                if(err) return reject(err);
                resolve();
            }
        );
    });
};

/**
 * Supprime une tâche
 * @param {number} id - ID de la tâche
 * @returns {Promise<void>}
 */
exports.deleteTodo = (id) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM todos WHERE id = ?', [id], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};