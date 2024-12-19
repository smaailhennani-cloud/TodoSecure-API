const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

/**
 * @route POST /users
 * @description Crée un nouvel utilisateur
 * @body {string} email - Email de l'utilisateur
 * @body {string} password - Mot de passe de l'utilisateur
 * @returns {201} Utilisateur créé
 */
router.post('/users', userController.createUser);     // POST /users

/**
 * @route GET /users
 * @description Récupère tous les utilisateurs
 * @returns {200} Liste d'utilisateurs
 */
router.get('/users', userController.getAllUsers);     // GET /users

/**
 * @route POST /users/login
 * @description Connecte un utilisateur et retourne un token JWT
 * @body {string} email - Email de l'utilisateur
 * @body {string} password - Mot de passe de l'utilisateur
 * @returns {200} Token JWT
 */
router.post('/login', userController.loginUser); // POST /login

module.exports = router;
