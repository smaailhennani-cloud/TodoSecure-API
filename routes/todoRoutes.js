const express = require('express');
const todoController = require('../controllers/todoController');
const authenticateToken = require('../middlewares/auth');

const router = express.Router();

// Toutes les routes todos sont protégées par un token JWT
router.use(authenticateToken);

/**
 * @route GET /todos
 * @description Récupère toutes les tâches
 * @returns {200} Liste de tâches
 */
router.get('/', todoController.getTodos);         // GET /todos

/**
 * @route GET /todos/:email
 * @description Récupère toutes les tâches associées à un email
 * @param {string} email - Email de l'utilisateur
 * @returns {200} Liste de tâches filtrées
 */
/**
router.get('/:email', todoController.getTodos);  // GET /todos/:email
 */
/**
 * @route POST /todos
 * @description Crée une nouvelle tâche
 * @body {string} title - Titre de la tâche
 * @body {string} description - Description de la tâche
 * @body {string} userEmail - Email de l'utilisateur associé
 * @returns {201} Tâche créée
 */
router.post('/', todoController.createTodo);      // POST /todos

/**
 * @route PUT /todos/:id
 * @description Met à jour une tâche existante
 * @param {number} id - ID de la tâche
 * @body {string} title - Nouveau titre
 * @body {string} description - Nouvelle description
 * @body {boolean} done - Statut de la tâche (true/false)
 * @returns {200} Succès
 */
router.put('/:id', todoController.updateTodo);     // PUT /todos/:id

/**
 * @route DELETE /todos/:id
 * @description Supprime une tâche par son ID
 * @param {number} id - ID de la tâche
 * @returns {200} Succès
 */
router.delete('/:id', todoController.deleteTodo);  // DELETE /todos/:id

module.exports = router;