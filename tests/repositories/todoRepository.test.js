jest.mock('../../database/db');
const db = require('../../database/db');
const todoRepository = require('../../repositories/todoRepository');

describe('todoRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getTodosByEmail', () => {
        test('doit retourner les tâches associées à l\'email de l\'utilisateur', async () => {
            db.query.mockImplementation((sql, values, callback) => {
                callback(null, [{ id: 1, title: 'Faire les courses', userEmail: 'test@gmail.com' }]);
            });

            const todo = await todoRepository.getTodosByEmail('test@gmail.com');

            expect(db.query).toHaveBeenCalledWith(
                'SELECT * FROM todos WHERE userEmail = ?',
                ['test@gmail.com'],
                expect.any(Function)
            );

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(todo).toEqual([{ id: 1, title: 'Faire les courses', userEmail: 'test@gmail.com' }]);
        });
        
        test('doit générer une erreur en cas de problème de base de données', async () => {
            db.query.mockImplementation((sql, values, callback) => {
                callback(new Error('Database error'));
            });

            const err = todoRepository.getTodosByEmail('test@gmail.com');

            expect(db.query).toHaveBeenCalledTimes(1);
            await expect(err).rejects.toThrow('Database error');
        });
    });
    
    describe('createTodo', () => {
        test('doit retourner l\'id de la tâche créée', async () => {
            db.query.mockImplementation((sql, values, callback) => {
                callback(null, { insertID: 1 });
            });

            const id = await todoRepository.createTodo('Faire les courses', 'Acheter du pain complet', 'test@gmail.com');

            expect(db.query).toHaveBeenCalledWith(
                'INSERT INTO todos (title, description, userEmail) VALUES (?, ?, ?)',
                ['Faire les courses', 'Acheter du pain complet', 'test@gmail.com'],
                expect.any(Function)
            );

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(id).toBe(1);
        });
        
        test('doit rejeter une erreur en cas d\'échec de création', async () => {
            db.query.mockImplementation((sql, values, callback) => {
                callback(new Error('Database error'));
            });

            const err = todoRepository.createTodo('Faire les courses', 'Acheter du pain complet', 'test@gmail.com');

            expect(db.query).toHaveBeenCalledTimes(1);
            await expect(err).rejects.toThrow('Database error');
        });
    });

    describe('updateTodo', () => {
        test('doit mettre à jour une tâche avec succès', async () => {
            db.query.mockImplementation((sql, values, callback) => {
                callback(null, null);
            });

            const id = await todoRepository.updateTodo(1, 'Faire les courses', 'Acheter du pain complet', true);

            expect(db.query).toHaveBeenCalledWith(
                'UPDATE todos SET title = ?, description = ?, done = ? WHERE id = ?',
                ['Faire les courses', 'Acheter du pain complet', true, 1],
                expect.any(Function)
            );
            expect(db.query).toHaveBeenCalledTimes(1);
        });
        
        test('doit rejeter en cas d\'erreur de mise à jour', async () => {
            db.query.mockImplementation((sql, values, callback) => {
                callback(new Error('Database error'));
            });

            const err = todoRepository.updateTodo(1, 'Faire les courses', 'Acheter du pain complet', true);

            await expect(err).rejects.toThrow('Database error');
        });
    });
    
    describe('deleteTodo', () => {
        test('doit supprimer une tâche avec succès', async () => {
            db.query.mockImplementation((sql, values, callback) => {
                callback(null, null);
            });

            await todoRepository.deleteTodo(1);

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(db.query).toHaveBeenCalledWith(
                'DELETE FROM todos WHERE id = ?',
                [1],
                expect.any(Function)
            );
        });
        
        test('doit rejeter en cas d\'erreur lors de la suppression', async () => {
            db.query.mockImplementation((sql, values, callback) => {
                callback(new Error('Database error'));
            });
            const err = todoRepository.deleteTodo(1);

            await expect(err).rejects.toThrow('Database error');
        });
    });
})