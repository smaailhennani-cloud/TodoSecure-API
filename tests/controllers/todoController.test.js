jest.mock('../../database/db.js');
const db = require('../../database/db');
todoController = require('../../controllers/todoController');
jest.mock('../../services/userService.js');
todoService = require('../../services/todoService');

describe('todoController', () => {
    let req; 
    let res;

    beforeEach(() => {
        req = {
            body: {},
            query: {},
            params: {},
        };
        res = {
            status: jest.fn().mockReturnThis(), // .mockReturnThis() permet le chaînage
            json: jest.fn(),
        };

        todoService.getTodosByUserEmail = jest.fn();
        todoService.getTodos = jest.fn();
        todoService.createTodo = jest.fn();
        todoService.updateTodo = jest.fn();
        todoService.deleteTodo = jest.fn();

        // Clear de tous les mocks avant chaque test
        jest.clearAllMocks();
    });

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        console.error.mockRestore();
    });

    describe('getTodos', () => {
        test('should return todos with the specified userEmail on success', async () => {
            req.query = { userEmail : 'example@gmail.com' };

            const mockResults = [ 
                { 
                    id: 1,
                    userEmail: 'example@gmail.com',
                    title: 'Acheter des courses',
                    description: 'Acheter du lait, du pain et des oeufs',
                    done: false,
                },
                {
                    id: 2,
                    userEmail: 'example@gmail.com',
                    title: 'Tache 2',
                    description: 'Description aléatoire',
                    done: true,
                },
            ];

            todoService.getTodosByUserEmail.mockResolvedValue(mockResults);

            await todoController.getTodos(req,res);

            expect(todoService.getTodosByUserEmail).toHaveBeenCalledWith('example@gmail.com');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResults);
        });
        
        test('should return todos if userEmail is empty on success', async () => {
            req.query = { userEmail : '' };
            
            const mockResults = [ 
                { 
                    id: 1,
                    userEmail: 'example@gmail.com',
                    title: 'Acheter des courses',
                    description: 'Acheter du lait, du pain et des oeufs',
                    done: false,
                },
                {
                    id: 2,
                    userEmail: 'example1@gmail.com',
                    title: 'Tache 2',
                    description: 'Description aléatoire',
                    done: true,
                },
            ];

            todoService.getTodos.mockResolvedValue(mockResults);

            await todoController.getTodos(req,res);

            expect(todoService.getTodos).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResults);
        });
        
        test('should return todos if userEmail is undefined on success', async () => {
            req.query = {};
            
            const mockResults = [ 
                { 
                    id: 1,
                    userEmail: 'example@gmail.com',
                    title: 'Acheter des courses',
                    description: 'Acheter du lait, du pain et des oeufs',
                    done: false,
                },
                {
                    id: 2,
                    userEmail: 'example1@gmail.com',
                    title: 'Tache 2',
                    description: 'Description aléatoire',
                    done: true,
                },
            ];

            todoService.getTodos.mockResolvedValue(mockResults);

            await todoController.getTodos(req,res);

            expect(todoService.getTodos).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResults);
        });

        test("should be return error 500 if todoService.getTodosByUserEmail fails", async() => {
            req.query = { userEmail: 'test@gmail.com' };

            const err = new Error('Erreur db');
            todoService.getTodosByUserEmail.mockRejectedValue(err);
            await todoController.getTodos(req, res);
    
            expect(todoService.getTodosByUserEmail).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ details: 'Erreur db', "message": "Erreur serveur" });
        });
        
        test("should return a 500 error if todoService.getTodos fails", async() => {
            req.query = { userEmail: '' };

            err = new Error('Erreur db');
            todoService.getTodos.mockRejectedValue(err);
            await todoController.getTodos(req, res);
    
            expect(todoService.getTodos).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ details: 'Erreur db', "message": "Erreur serveur" });
        });
    });

    describe('createTodo', () => {
        test("should return a 400 error if title, description, or userEmail is empty", async() => {
            req.body = { title: '', description: '', userEmail: '' };
            await todoController.createTodo(req, res);
    
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Les champs title, description et userEmail sont requis.'});
        });
        
        test("should return a success message and todoId if todoService.createTodo succeeds", async() => {
            req.body = { title: 'Acheter des courses', description: 'Acheter du lait, du pain et des oeufs', userEmail: 'test@gmail.com' };
    
            todoService.createTodo.mockResolvedValue({ message: 'Tache ajoutée avec succès', todoId: 1 });
            await todoController.createTodo(req,res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'Tache ajoutée avec succès', todoId: 1 });
        });

        test("should return a 500 error if todoService.createTodo fails", async() => {
            req.body = { title: 'Acheter des courses', description: 'Acheter du lait, du pain et des oeufs', userEmail: 'test@gmail.com' };

            const err = new Error('Erreur db');
            todoService.createTodo.mockRejectedValue(err);
            await todoController.createTodo(req, res);
    
            expect(todoService.createTodo).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ details: 'Erreur db', message: "Erreur serveur" });
        });
    });
    
    describe('updateTodo', () => {
        test("should return a 400 error if title, description, or done is missing", async() => {
            req.body = { title: '', description: '', done: '' };
            await todoController.updateTodo(req, res);
    
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Les champs title, description et done sont requis.'});
        });
        
        test("should update the todo and return a success message if updateTodo succeeds", async() => {
            req.params = { id: 1 };
            req.body = { title: 'Faires les courses', description: 'Acheter du pain', done : false };
    
            await todoController.updateTodo(req,res);

            expect(todoService.updateTodo).toHaveBeenCalledWith(1, 'Faires les courses', 'Acheter du pain', false);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Tâche mise à jour avec succès.' });
        });

        test("should return a 500 error if todoService.updateTodo fails", async() => {
            req.params = { id: 1 };
            req.body = { title: 'Faires les courses', description: 'Acheter du pain', done : true };

            const err = new Error('Erreur db');
            todoService.updateTodo.mockRejectedValue(err);
            await todoController.updateTodo(req, res);
    
            expect(todoService.updateTodo).toHaveBeenCalledWith(1, 'Faires les courses', 'Acheter du pain', true);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ details: 'Erreur db', message: "Erreur serveur" });
        });
    });

    describe("deleteTodo", () => {
        test("should return a success message if todoService.deleteTodo succeeds", async () => {
            req.params = { id: 1 };

            await todoController.deleteTodo(req,res);
            expect(todoService.deleteTodo).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Tâche supprimée avec succès.' });

        });

        test("should return a 500 error if todoService.deleteTodo fails", async() => {
            req.params = { id: 1 };

            const err = new Error('Erreur db');
            todoService.deleteTodo.mockRejectedValue(err);
            await todoController.deleteTodo(req, res);
    
            expect(todoService.deleteTodo).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ details: 'Erreur db', message: "Erreur serveur" });
        });
    });
});