jest.mock('../../database/db.js');
const db = require('../../database/db');
userController = require('../../controllers/userController');
jest.mock('../../services/userService');
userService = require('../../services/userService');
describe('userController', () => {
    let req;
    let res;

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        console.error.mockRestore();
    });
    
    beforeEach(() => {
        // On réinitialise le req et le res avant chaque test
        req = {
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(), // .mockReturnThis() permet le chaînage
            json: jest.fn(),
        };

        // Mock userService.loginUser
        userService.loginUser = jest.fn();
    
        // Clear de tous les mocks avant chaque test
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        test("should be return error 400 if email or password is empty!", async() => {
            req.body = { email: '', password: '' };
            
            await userController.createUser(req, res);
    
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Les champs email et password sont requis.' });
        });
        
        test("should be return error 500 if userService.createUser fails", async() => {
            req.body = { email: 'test@example.com', password: 'password123' };

            err = new Error('Erreur db');
            userService.createUser.mockRejectedValue(err);
            await userController.createUser(req, res);
    
            expect(userService.createUser).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Erreur db' });
        });

        test("should be return message if userService.createUser on succes", async() => {
            req.body = { email: 'test@example.com', password: 'password123' };

            userService.createUser.mockResolvedValue( { message: 'Utilisateur créé avec succès.' } );
            await userController.createUser(req, res);

            expect(userService.createUser).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith( { message: 'Utilisateur créé avec succès.'});
        });
    });

    describe('getAllUsers', () => {
        test("should be return all users on succes", async() => {
            userService.getAllUsers.mockResolvedValue([
                { id: 1, email: 'test1@example.com' },
                { id: 2, email: 'test2@example.com' }
            ]);
            
            await userController.getAllUsers(req, res);

            expect(userService.getAllUsers).toHaveBeenCalled();
    
            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith([
                { id:1, email: 'test1@example.com' },
                { id:2, email: 'test2@example.com' }
            ]);
        });
        
        test("should be return error 500 if userService.getAllUsers fails", async() => {
            err = new Error('Erreur db');
            userService.getAllUsers.mockRejectedValue(err);

            await userController.getAllUsers(req, res);
    
            expect(userService.getAllUsers).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ 
                message: 'Erreur serveur', 
                details: 'Erreur db' 
            });
        });
    });

    describe('loginUser', () => {
        test("should be return token if userService.loginUser succeeds", async() => {
            req.body = { email: 'test@example.com', password: 'password123' };
            userService.loginUser.mockResolvedValue('fakeToken');
    
            await userController.loginUser(req, res);
    
            expect(userService.loginUser).toHaveBeenCalledWith(
                'test@example.com',
                'password123'
            );
            
            expect(res.json).toHaveBeenCalledWith({ token: 'fakeToken' });
        });
        
        test("should be return error 400 if email or password is empty!", async() => {
            req.body = { email: '', password: '' };
    
            await userController.loginUser(req, res);
            
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Les champs email et password sont requis.' });
        });
        
        test("should be return error 500 if userService.loginUser fails", async() => {
            req.body = { email: 'test@example.com', password: 'password123' };

            err = new Error('Erreur db');
            userService.loginUser.mockRejectedValue(err);
            await userController.loginUser(req,res);

            expect(userService.loginUser).toHaveBeenCalledWith(
                'test@example.com',
                'password123'
            );              
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith( { error: "Erreur db" } );
        });
    });
    
});