jest.mock('../../database/db.js'); // Mock de database/db.js
jest.mock('../../repositories/userRepository.js');

const userService = require('../../services/userService');
const userRepository = require('../../repositories/userRepository');



describe('userService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should be create a user and return message + userId', async () => {
        userRepository.getUserByEmail.mockResolvedValue(undefined);
        userRepository.createUser.mockResolvedValue(123); // createUser return fake ID
        
        const result = await userService.createUser('test@example.com', 'password123');
        expect(result).toEqual({ message: 'Utilisateur créé avec succès.' });

        expect(userRepository.getUserByEmail).toHaveBeenCalledWith('test@example.com');
        expect(userRepository.createUser).toHaveBeenCalled();
    });
    
    test('should throw an error if the email is already in use', async () => {
        userRepository.getUserByEmail.mockResolvedValue({ email: 'test@example.com' });

        await expect(
            userService.createUser('test@example.com', 'password123')
        ).rejects.toThrow('Cet email est déjà utilisé.');
    });
});