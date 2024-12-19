const todoRepository = require('../repositories/todoRepository');

/**
 * Récupère les tâches d'un utilisateur spécifique par son email
 * @param {string} userEmail - Email de l'utilisateur
 * @returns {Array} Liste de tâches
 */
exports.getTodosByUserEmail = async (userEmail) => {
    return await todoRepository.getTodosByEmail(userEmail);
};


/**
 * Récupère les tâches
 * @returns {Array} Liste de tâches
 */
exports.getTodos = async () => {
    return await todoRepository.getTodos();
};

/**
 * Crée une nouvelle tâche
 * @param {string} title
 * @param {string} description
 * @param {string} userEmail
 * @returns {Object} Message de succès et ID de la tâche
 */
exports.createTodo = async (title, description, userEmail) => {
    const todoId = await todoRepository.createTodo(title, description, userEmail);
    return { message: 'Tache ajoutée avec succès', todoId};
};

/**
 * Met à jour une tâche existante
 * @param {number} id - ID de la tâche
 * @param {string} title - Nouveau titre
 * @param {string} description - Nouvelle description
 * @param {boolean} done - Statut de la tâche
 */
exports.updateTodo = async (id, title, description, done) => {
    await todoRepository.updateTodo(id, title, description, done);
};

/**
 * Supprime une tâche par son ID
 * @param {number} id - ID de la tâche
 */
exports.deleteTodo = async (id) => {
    await todoRepository.deleteTodo(id);
}