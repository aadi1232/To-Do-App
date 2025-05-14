import type { User, Group } from './';

export interface Todo {
	_id: string;
	title: string;
	completed: boolean;
	user: User | string;
	group: Group | string | null;
	createdBy: User | string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateTodoData {
	title: string;
	completed?: boolean;
}
