jest.mock('../../repositories/todoRepository.js');

const todoService = require('../../services/todoService');
const todoRepository = require('../../repositories/todoRepository');



describe('todoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getTodosByUserEmail', () => {
        it('should return todos for a specific user email', async () => {
            const mockTodos = [{ id: 1, title: 'Faire les courses', userEmail: 'test@gmail.com' }];
            todoRepository.getTodosByEmail.mockResolvedValue(mockTodos);

            const result = await todoService.getTodosByUserEmail('test@gmail.com');

            expect(todoRepository.getTodosByEmail).toHaveBeenCalledWith('test@gmail.com');
            expect(result).toEqual(mockTodos);
        });
    });

    describe('getTodos', () => {
        it('should return all todos', async () => {
            const mockTodos = [{ id: 1, title: 'Faire les courses' }, { id: 2, title: 'Reviser les leçons' }];
            todoRepository.getTodos.mockResolvedValue(mockTodos);

            const result = await todoService.getTodos();

            expect(todoRepository.getTodos).toHaveBeenCalled();
            expect(result).toEqual(mockTodos);
        });
    });

    describe('createTodo', () => {
        it('should create a todo and return a success message and todo ID', async () => {
            const mockTodoId = 1;
            todoRepository.createTodo.mockResolvedValue(mockTodoId);

            const result = await todoService.createTodo('Faire les courses', 'Acheter du pain complet', 'test@gmail.com');

            expect(todoRepository.createTodo).toHaveBeenCalledWith('Faire les courses', 'Acheter du pain complet', 'test@gmail.com');
            expect(result).toEqual({ message: 'Tache ajoutée avec succès', todoId: mockTodoId });
        });
    });

    describe('updateTodo', () => {
        it('should update a todo', async () => {
            todoRepository.updateTodo.mockResolvedValue();

            await todoService.updateTodo(1, 'Construction maison', 'Acheter des briques', true);

            expect(todoRepository.updateTodo).toHaveBeenCalledWith(1, 'Construction maison', 'Acheter des briques', true);
        });
    });

    describe('deleteTodo', () => {
        it('should delete a todo by ID', async () => {
            todoRepository.deleteTodo.mockResolvedValue();

            await todoService.deleteTodo(1);

            expect(todoRepository.deleteTodo).toHaveBeenCalledWith(1);
        });
    });
});