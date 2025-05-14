import Todo from '../models/todo.model.js';

export async function createTodo(userId, data) {
    return await Todo.create({ ...data, user: userId });
}

export async function getTodosByUser(userId) {
    return await Todo.find({ user: userId }).sort({ createdAt: -1 });
}