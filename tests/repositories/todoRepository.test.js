jest.mock('../../database/db');
const db = require('../../database/db');
const todoRepository = require('../../repositories/todoRepository');

describe('todoRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getTodosByEmail', () => {
        test('should return todos with userEmail', async () => {
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
        
        test('should reject with an error if the database encounters an issue', async () => {
            db.query.mockImplementation((sql, values, callback) => {
                callback(new Error('Database error'));
            });

            const err = todoRepository.getTodosByEmail('test@gmail.com');

            expect(db.query).toHaveBeenCalledTimes(1);
            await expect(err).rejects.toThrow('Database error');
        });
    });
    
    describe('createTodo', () => {
        test('should return the id of the created todo', async () => {
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
        
        test('should reject with an error if the database encounters an issue', async () => {
            db.query.mockImplementation((sql, values, callback) => {
                callback(new Error('Database error'));
            });

            const err = todoRepository.createTodo('Faire les courses', 'Acheter du pain complet', 'test@gmail.com');

            expect(db.query).toHaveBeenCalledTimes(1);
            await expect(err).rejects.toThrow('Database error');
        });
    });

    describe('updateTodo', () => {
        test('should update a todo and resolve succefully', async () => {
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
        
        test('should reject with an error if the database encounters an issue', async () => {
            db.query.mockImplementation((sql, values, callback) => {
                callback(new Error('Database error'));
            });

            const err = todoRepository.updateTodo(1, 'Faire les courses', 'Acheter du pain complet', true);

            await expect(err).rejects.toThrow('Database error');
        });
    });
    
    describe('deleteTodo', () => {
        test('should delete the todo successfully', async () => {
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
        
        test('should reject with an error if the database encounters an issue', async () => {
            db.query.mockImplementation((sql, values, callback) => {
                callback(new Error('Database error'));
            });
            const err = todoRepository.deleteTodo(1);

            await expect(err).rejects.toThrow('Database error');
        });
    });
})