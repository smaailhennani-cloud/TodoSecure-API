// __tests__/repositories/userRepository.test.js

jest.mock('../../database/db'); // Mock du fichier db.js
const db = require('../../database/db');
const userRepository = require('../../repositories/userRepository');

describe('userRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------
  //       getUserByEmail
  // ---------------------------
  describe('getUserByEmail', () => {
    test('devrait renvoyer un utilisateur si trouvé', async () => {
      db.query.mockImplementation((sql, values, callback) => {
        callback(null, [{ id: 1, email: 'test@example.com', password: 'hashedpassword' }], []);
      });

      const user = await userRepository.getUserByEmail('test@example.com');

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        ['test@example.com'],
        expect.any(Function)
      );
      expect(user).toEqual({ id: 1, email: 'test@example.com', password: 'hashedpassword' });
    });

    test("devrait renvoyer 'undefined' si aucun utilisateur n'est trouvé", async () => {
      db.query.mockImplementation((sql, values, callback) => {
        callback(null, [], []);
      });

      const user = await userRepository.getUserByEmail('notfound@example.com');

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        ['notfound@example.com'],
        expect.any(Function)
      );
      expect(user).toBeUndefined();
    });

    test('devrait lever une erreur si la base de données rencontre un problème', async () => {
      db.query.mockImplementation((sql, values, callback) => {
        callback(new Error('Database error'), null, null);
      });

      await expect(userRepository.getUserByEmail('test@example.com')).rejects.toThrow('Database error');
    });
  });

  // ---------------------------
  //         createUser
  // ---------------------------
  describe('createUser', () => {
    test("devrait créer un nouvel utilisateur et renvoyer l'ID inséré", async () => {
      // Simule un insertId de 42
      db.query.mockImplementation((sql, values, callback) => {
        callback(null, { insertId: 42 });
      });

      const insertId = await userRepository.createUser('newuser@example.com', 'hashedpassword');
      
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        ['newuser@example.com', 'hashedpassword'],
        expect.any(Function)
      );
      expect(insertId).toBe(42);
    });

    test('devrait lever une erreur si la base de données rencontre un problème lors de la création', async () => {
      db.query.mockImplementation((sql, values, callback) => {
        callback(new Error('Insert error'), null);
      });

      await expect(
        userRepository.createUser('newuser@example.com', 'hashedpassword')
      ).rejects.toThrow('Insert error');
    });
  });

  // ---------------------------
  //        getAllUsers
  // ---------------------------
  describe('getAllUsers', () => {
    test('devrait renvoyer tous les utilisateurs', async () => {
      const fakeUsers = [
        { id: 1, email: 'user1@example.com', password: 'hashed1' },
        { id: 2, email: 'user2@example.com', password: 'hashed2' },
      ];

      db.query.mockImplementation((sql, callback) => {
        callback(null, fakeUsers);
      });

      const users = await userRepository.getAllUsers();

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM users', expect.any(Function));
      expect(users).toEqual(fakeUsers);
    });

    test('devrait lever une erreur si la base de données rencontre un problème lors de la récupération', async () => {
      db.query.mockImplementation((sql, callback) => {
        callback(new Error('Select error'), null);
      });

      await expect(userRepository.getAllUsers()).rejects.toThrow('Select error');
    });
  });
});
