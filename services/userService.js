const userRepository = require('../repositories/userRepository');

/**
 * Crée un nouvel utilisateur après vérification de l'email et hachage du mot de passe
 * @param {string} email
 * @param {string} password
 * @throws {Error} Si l'email existe déjà
 * @returns {Object} Objet avec un message de succès // et l'ID de l'utilisateur
 */
exports.createUser = async (email, password) => {
    existingUser = await userRepository.getUserByEmail(email);
    if (existingUser) {
        const error = new Error('Cet email est déja utilisé.');
        error.statusCode = 400;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await userRepository.createUser(email, hashedPassword);
    return { message: 'Utilisateur créé avec succès.' };
};

/**
 * Récupère tous les utilisateurs
 * @returns {Array} Liste d'utilisateurs
 */
exports.getAllUsers = async() => {
    return await userRepository.getAllUsers();
};

/**
 * Authentifie un utilisateur et génère un token JWT
 * @param {string} email
 * @param {string} password
 * @throws {Error} Si l'utilisateur n'est pas trouvé ou si le mot de passe est incorrect
 * @returns {string} Token JWT
 */
exports.loginUser = async (email, password) => {
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
        const error = new Error('Utilisateur non trouvé.');
        throw error;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        const error = new Error('Mot de passe incorrect.');
        error.statusCode = 401;
        throw error;
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {expiresIn: '1h' });
    return token;
};
