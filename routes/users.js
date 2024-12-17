const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

/**
 * @route POST /users
 * @description Crée un nouvel utilisateur avec un mot de passe haché
 * @bodyParam {string} email - Email unique de l'utilisateur
 * @bodyParam {string} password - Mot de passe en texte clair
 * @returns {201} JSON contenant un message de succès
 * @returns {400} JSON indiquant que les champs requis sont manquants ou que l'email existe déjà
 * @returns {500} JSON en cas d'erreur serveur
 */
router.post('/users', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Les champs email et password sont requis.' });
  }

  // Vérifier si l'email existe déjà
  db.query('SELECT email FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Erreur SQL :', err);
      return res.status(500).json({ message: 'Erreur serveur', details: err.message });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    }

    // Hacher le mot de passe
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Erreur lors du hachage :', err);
        return res.status(500).json({ message: 'Erreur serveur lors du hachage.' });
      }

      // Insérer le nouvel utilisateur dans la base de données
      db.query(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email, hashedPassword],
        (err) => {
          if (err) {
            console.error('Erreur SQL lors de l\'insertion :', err);
            return res.status(500).json({ message: 'Erreur serveur', details: err.message });
          }

          res.status(201).json({ message: 'Utilisateur créé avec succès.' });
        }
      );
    });
  });
});

/**
 * @route GET /users
 * @description Crée un nouvel utilisateur avec un mot de passe haché
 * @bodyParam {string} email - Email unique de l'utilisateur
 * @bodyParam {string} password - Mot de passe en texte clair
 * @returns {201} JSON contenant un message de succès
 * @returns {400} JSON indiquant que les champs requis sont manquants ou que l'email existe déjà
 * @returns {500} JSON en cas d'erreur serveur
 */
router.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      console.error('Erreur SQL :', err);
      return res.status(500).json({ message: 'Erreur serveur', details: err.message });
    }
    return res.status(201).json(results);
  });
});

/**
 * @route POST /login
 * @description Connecte un utilisateur en vérifiant les identifiants et génère un token JWT
 * @bodyParam {string} email - Email de l'utilisateur
 * @bodyParam {string} password - Mot de passe de l'utilisateur
 * @returns {200} JSON contenant un token JWT valide
 * @returns {400} JSON si les champs requis sont manquants
 * @returns {404} JSON si l'utilisateur n'est pas trouvé
 * @returns {401} JSON si le mot de passe est incorrect
 * @returns {500} JSON en cas d'erreur serveur
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Les champs email et password sont requis.' });
  }

  // Vérifier si l'utilisateur existe
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Erreur SQL :', err);
      return res.status(500).json({ message: 'Erreur serveur', details: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    const user = results[0];

    // Comparer le mot de passe haché
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) {
        console.error('Erreur de comparaison bcrypt :', err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }

      if (!match) {
        return res.status(401).json({ error: 'Mot de passe incorrect.' });
      }

      // Générer le token JWT
      const token = jwt.sign({ email: user.email }, 'votre_clé_secrète', { expiresIn: '1h' });
      res.json({ token });
    });
  });
});

module.exports = router;
