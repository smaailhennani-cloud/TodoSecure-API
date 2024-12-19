const todoService = require('../services/todoService');

/**
 * Récupère les tâches, optionnellement filtrées par userEmail
 * @function getTodos
 * @param {Request} req
 * @param {Response} res
 */
exports.getTodos = async (req, res) => {
    const { email } = req.params;
    try {
        if (email) {
            const todosUser = await todoService.getTodosByUserEmail(email);
            res.status(200).json(todosUser);
        } else {
            const todos = await todoService.getTodos();
            res.status(200).json(todos);
        }
    } catch (err) {
        console.error('Error :', err);
        res.status(500).json({ message: 'Erreur serveur', details: err.message });
    }
};

/**
 * Crée une nouvelle tâche
 * @function createTodo
 * @param {Request} req
 * @param {Response} res
 */
exports.createTodo = async (req, res) => {
    const { title, description, userEmail } = req.body;

    if (!title || !description || !userEmail) {
        return res.status(400).json({ error: 'Les champs title, description et userEmail sont requis.' });
    }
    try {
        const result = await todoService.createTodo(title, description, userEmail);
        res.status(201).json(result);
    } catch (err) {
        console.error("Error :", err);
        res.status(500).json({ message: 'Erreur serveur', details: err.message });
    }
};

/**
 * Met à jour une tâche existante
 * @function updateTodo
 * @param {Request} req
 * @param {Response} res
 */
exports.updateTodo = async (req, res) => {
    const { id } = req.params;
    const { title, description, done } = req.body;

    if (!title || !description || done === undefined) {
        return res.status(400).json({ error: 'Les champs title, description et done sont requis.' });
    }

    try {
        await todoService.updateTodo(id, title, description, done);
        return res.status(200).json({ message: 'Tâche mise à jour avec succès.' });
    } catch (err) {
        console.error("Error :", err);
        res.status(500).json({ message: 'Erreur serveur', details: err.message });
    }
};

/**
 * Supprime une tâche par son ID
 * @function deleteTodo
 * @param {Request} req
 * @param {Response} res
 */
exports.deleteTodo = async (req, res) => {
    const { id } = req.params;
    try {
        await todoService.deleteTodo(id);
        return res.status(200).json({ message: 'Tâche supprimée avec succès.' });
    } catch (err) {
        console.error("Error :", err);
        res.status(500).json({ message: 'Erreur serveur', details: err.message });
    }
};