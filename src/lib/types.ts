export interface User {
	_id: string;
	username: string;
	email: string;
	profileImage?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface GroupMember {
	_id?: string;
	user: User | string;
	role: 'admin' | 'co-lead' | 'elder' | 'member';
	invitationStatus: 'pending' | 'accepted' | 'declined';
	addedBy?: User | string;
	createdAt?: string;
	updatedAt?: string;
}

export interface Group {
	_id: string;
	name: string;
	imageUrl?: string;
	createdBy: User | string;
	members: GroupMember[];
	createdAt?: string;
	updatedAt?: string;
}

// Since we're using the Group object for pending invitations too,
// we'll create a type alias for clarity
export interface GroupInvitation {
	_id: string;
	group: Group;
	invitedBy: User;
	status: 'pending' | 'accepted' | 'declined';
	createdAt: string;
}

export interface Todo {
	_id: string;
	title: string;
	completed: boolean;
	description?: string;
	dueDate?: string;
	priority?: 'low' | 'medium' | 'high';
	group?: Group | string;
	user?: User | string;
	createdBy: User | string;
	createdAt?: string;
	updatedAt?: string;
	textColor?: string;
	isHighlighted?: boolean;
	deadline?: 'today' | 'tomorrow' | 'later' | null;
	taggedMembers?: User[] | string[];
}

export interface CreateTodoData {
	title: string;
	completed?: boolean;
	textColor?: string;
	isHighlighted?: boolean;
	deadline?: 'today' | 'tomorrow' | 'later' | null;
	taggedMembers?: string[];
}

export interface CreateGroupData {
	name: string;
	imageUrl?: string;
	invitees?: { email: string }[] | string[];
}

export interface UpdateGroupData {
	name?: string;
	imageUrl?: string;
}
