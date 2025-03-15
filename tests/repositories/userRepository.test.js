jest.mock('../../database/db'); // Mock du fichier db.js
const db = require('../../database/db');
const userRepository = require('../../repositories/userRepository');

describe('userRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserByEmail', () => {
    test('doit retourner un utilisateur existant', async () => {
      db.query.mockImplementation((sql, values, callback) => {
        callback(null, [{ id: 1, email: 'test@example.com', password: 'hashedpassword' }], []);
      });

      const user = await userRepository.getUserByEmail('test@example.com');

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        ['test@example.com'],
        expect.any(Function)
      );
      expect(user).toEqual({ 
        id: 1, email: 'test@example.com', password: 'hashedpassword' 
      });
    });

    test("doit retourner undefined si aucun utilisateur trouvé", async () => {
      db.query.mockImplementation((sql, values, callback) => {
        callback(null, [], []);
      });

      const user = await userRepository.getUserByEmail('userUndefined@test.com');

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        ['userUndefined@test.com'],
        expect.any(Function)
      );
      expect(user).toBeUndefined();
    });

    test('doit rejeter une erreur en cas d\'erreur SQL', async () => {
      db.query.mockImplementation((sql, values, callback) => {
        callback(new Error('Database error'), null, null);
      });

      await expect(userRepository.getUserByEmail('test@test.com')).rejects.toThrow('Database error');
    });
  });

  describe('createUser', () => {
    test('doit retourner l\'ID de l\'utilisateur créé', async () => {
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

    test('doit rejeter une erreur en cas d\'erreur de création', async () => {
      db.query.mockImplementation((sql, values, callback) => {
        callback(new Error('Insert error'), null);
      });

      await expect(
        userRepository.createUser('newuser@test.com', 'hashedpassword')
      ).rejects.toThrow('Insert error');
    });
  });

  describe('getAllUsers', () => {
    test('doit retourner la liste complète des utilisateurs', async () => {
      const fakeUsers = [
        { id: 1, email: 'user1@test.com', password: 'hashed1' },
        { id: 2, email: 'user2@test.com', password: 'hashed2' },
      ];

      db.query.mockImplementation((sql, callback) => {
        callback(null, fakeUsers);
      });

      const users = await userRepository.getAllUsers();

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM users', expect.any(Function));
      expect(users).toEqual(fakeUsers);
    });

    test('doit rejeter une erreur en cas d\'erreur de requête SQL', async () => {
      db.query.mockImplementation((sql, callback) => {
        callback(new Error('Select error'), null);
      });

      await expect(userRepository.getAllUsers()).rejects.toThrow('Select error');
    });
  });
});
