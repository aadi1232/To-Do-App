import type { Todo } from '$lib/types';

// Define the CreateTodoData interface
export interface CreateTodoData {
	title: string;
	description?: string;
	completed?: boolean;
	dueDate?: string;
	priority?: 'low' | 'medium' | 'high';
	textColor?: string;
	isHighlighted?: boolean;
	deadline?: 'today' | 'tomorrow' | 'later' | null;
	taggedMembers?: string[];
}

/**
 * API client functions for todo operations
 */

/**
 * Get all todos for the current user
 * @returns Array of todo objects
 */
export async function getUserTodos(): Promise<Todo[]> {
	const response = await fetch('/api/todos', {
		credentials: 'include'
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to fetch todos');
	}

	const data = await response.json();
	return data;
}

/**
 * Create a new todo for the current user
 * @param todoData Todo data
 * @returns Created todo object
 */
export async function createTodo(todoData: CreateTodoData): Promise<Todo> {
	const response = await fetch('/api/todos', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify(todoData)
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to create todo');
	}

	return response.json();
}

/**
 * Update a personal todo
 * @param todoId ID of the todo
 * @param todoData Todo data to update
 * @returns Updated todo object
 */
export async function updateTodo(todoId: string, todoData: Partial<CreateTodoData>): Promise<Todo> {
	const response = await fetch(`/api/todos/${todoId}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify(todoData)
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to update todo');
	}

	return response.json();
}

/**
 * Delete a personal todo
 * @param todoId ID of the todo
 */
export async function deleteTodo(todoId: string): Promise<void> {
	const response = await fetch(`/api/todos/${todoId}`, {
		method: 'DELETE',
		credentials: 'include'
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to delete todo');
	}
}

/**
 * Get all todos for a specific group
 * @param groupId ID of the group
 * @returns Array of todo objects
 */
export async function getGroupTodos(groupId: string): Promise<Todo[]> {
	const response = await fetch(`/api/todos/by-group/${groupId}`, {
		credentials: 'include'
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to fetch group todos');
	}

	const data = await response.json();
	return data;
}

/**
 * Create a new todo in a group
 * @param groupId ID of the group
 * @param todoData Todo data
 * @param groupName Optional group name to include in notifications
 * @returns Created todo object
 */
export async function createGroupTodo(
	groupId: string,
	todoData: CreateTodoData,
	groupName?: string
): Promise<Todo> {
	const response = await fetch(`/api/todos/by-group/${groupId}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify({
			...todoData,
			groupName: groupName || '' // Include group name for notifications
		})
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to create group todo');
	}

	return response.json();
}

/**
 * Update a todo in a group
 * @param todoId ID of the todo
 * @param todoData Todo data to update
 * @returns Updated todo object
 */
export async function updateGroupTodo(
	todoId: string,
	todoData: Partial<CreateTodoData>
): Promise<Todo> {
	const response = await fetch(`/api/todos/by-id/${todoId}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'include',
		body: JSON.stringify(todoData)
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to update group todo');
	}

	return response.json();
}

/**
 * Delete a todo in a group
 * @param todoId ID of the todo
 */
export async function deleteGroupTodo(todoId: string): Promise<void> {
	const response = await fetch(`/api/todos/by-id/${todoId}`, {
		method: 'DELETE',
		credentials: 'include'
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Failed to delete group todo');
	}

	return;
}
