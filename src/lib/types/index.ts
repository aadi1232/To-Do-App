// Export all types for the application

export interface User {
	_id: string;
	username: string;
	email: string;
	profileImage?: string;
}

export interface Todo {
	_id: string;
	title: string;
	completed: boolean;
	user: string | User;
	group?: string | Group;
	createdBy: string | User;
	createdAt: string;
	updatedAt: string;
}

export interface CreateTodoData {
	title: string;
	completed?: boolean;
}

export interface Group {
	_id: string;
	name: string;
	imageUrl?: string;
	members: GroupMember[];
	createdBy: string | User;
	createdAt: string;
	updatedAt: string;
}

export interface CreateGroupData {
	name: string;
	imageUrl?: string;
	invitees?: string[];
}

export interface UpdateGroupData {
	name?: string;
	imageUrl?: string;
}

export interface GroupMember {
	_id?: string;
	user: string | User;
	role: 'admin' | 'co-lead' | 'elder' | 'member';
	invitationStatus: 'pending' | 'accepted' | 'declined';
	addedBy?: string | User;
	createdAt?: string;
	updatedAt?: string;
}

export interface GroupInvitation {
	_id: string;
	group: Group;
	invitedBy: User;
	status: 'pending' | 'accepted' | 'declined';
	createdAt: string;
}
