const userService = require('../services/userService');

/**
 * Crée un nouvel utilisateur
 * @function createUser
 * @param {Request} req
 * @param {Response} res
 */
exports.createUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Les champs email et password sont requis.'});
    }

    try {
        const result = await userService.createUser(email, password);
        return result;
    } catch (err) {
        const status = err.statusCode || 500;
        return res.status(status).json({ error: err.message });
    }
};

/**
 * Récupère tous les utilisateurs
 * @function getAllUsers
 * @param {Request} req
 * @param {Response} res
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (err) {
        console.error('Erreur :', err);
        return res.status(500).json({ message: 'Erreur serveur', details: err.message });
    }
}

/**
 * Connecte un utilisateur et génère un token JWT
 * @function loginUser
 * @param {Request} req
 * @param {Response} res
 */
exports.loginUser = async (req, res) => {
    const {email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({error : "Les champs email et password sont requis."});
    }
    try {
        const token = await userService.loginUser(email, password);
        res.json({ token });
    } catch (err) {
        const status = err.statusCode || 500;
        res.status(status).json({ error: err.message });
    }
}