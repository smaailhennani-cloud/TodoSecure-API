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
    test('should return a user if found', async () => {
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

    test("should return 'undefined' if no user is found", async () => {
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

    test('should reject with an error if the database encounters an issue', async () => {
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
    test("should create a new user and return the inserted ID", async () => {
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

    test('should throw an error if the database encounters a problem during creation', async () => {
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
    test('should return all users', async () => {
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

    test('should throw an error if the database encounters a problem during recovery', async () => {
      db.query.mockImplementation((sql, callback) => {
        callback(new Error('Select error'), null);
      });

      await expect(userRepository.getAllUsers()).rejects.toThrow('Select error');
    });
  });
});
