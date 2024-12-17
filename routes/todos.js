const express = require('express');
const db = require('../db');
const authenticateToken = require('../middlewares/auth');
const router = express.Router();

// Middleware JWT : Appliqué à toutes les routes ci-dessous
router.use(authenticateToken);

/**
 * @route GET /todos
 * @description Récupérer toutes les tâches (optionnellement filtrées par utilisateur)
 * @queryParam {string} userEmail (optionnel) - Filtre les tâches par email de l'utilisateur
 */
router.get('/', (req, res) => {
  const { userEmail } = req.query;

  const query = userEmail
    ? 'SELECT * FROM todos WHERE userEmail = ?'
    : 'SELECT * FROM todos';
  const params = userEmail ? [userEmail] : [];

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Erreur SQL :', err);
      return res.status(500).json({ message: 'Erreur serveur', details: err.message });
    }
    res.json(results);
  });
});

/**
 * @route GET /todos/:email
 * @description Récupérer les tâches associées à un utilisateur spécifique
 * @param {string} email - L'email de l'utilisateur
 */
router.get('/:email', (req, res) => {
  const { email } = req.params;

  db.query('SELECT * FROM todos WHERE userEmail = ?', [email], (err, results) => {
    if (err) {
      console.error('Erreur SQL :', err);
      return res.status(500).json({ message: 'Erreur serveur', details: err.message });
    }
    res.json(results);
  });
});

/**
 * @route POST /todos
 * @description Créer une nouvelle tâche
 * @bodyParam {string} title - Le titre de la tâche
 * @bodyParam {string} description - La description de la tâche
 * @bodyParam {string} userEmail - L'email de l'utilisateur associé
 */
router.post('/', (req, res) => {
  const { title, description, userEmail } = req.body;

  if (!title || !description || !userEmail) {
    return res.status(400).json({ error: 'Les champs title, description et userEmail sont requis.' });
  }

  db.query(
    'INSERT INTO todos (title, description, userEmail) VALUES (?, ?, ?)',
    [title, description, userEmail],
    (err, results) => {
      if (err) {
        console.error('Erreur SQL :', err);
        return res.status(500).json({ message: 'Erreur serveur', details: err.message });
      }
      res.status(201).json({ message: 'Tâche ajoutée avec succès', todoId: results.insertId });
    }
  );
});

/**
 * @route PUT /todos/:id
 * @description Mettre à jour une tâche existante par son ID
 * @param {number} id - L'ID de la tâche à mettre à jour
 * @bodyParam {string} title - Nouveau titre de la tâche
 * @bodyParam {string} description - Nouvelle description de la tâche
 * @bodyParam {boolean} done - Statut de la tâche (complétée ou non)
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, done } = req.body;

  if (!title || !description || done === undefined) {
    return res.status(400).json({ error: 'Les champs title, description et done sont requis.' });
  }

  db.query(
    'UPDATE todos SET title = ?, description = ?, done = ? WHERE id = ?',
    [title, description, done, id],
    (err) => {
      if (err) {
        console.error('Erreur SQL :', err);
        return res.status(500).json({ message: 'Erreur serveur', details: err.message });
      }
      res.json({ message: 'Tâche mise à jour avec succès.' });
    }
  );
});

/**
 * @route DELETE /todos/:id
 * @description Supprimer une tâche par son ID
 * @param {number} id - L'ID de la tâche à supprimer
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM todos WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Erreur SQL :', err);
      return res.status(500).json({ message: 'Erreur serveur', details: err.message });
    }
    res.json({ message: 'Tâche supprimée avec succès.' });
  });
});

module.exports = router;
