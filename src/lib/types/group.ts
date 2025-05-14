import type { User } from './user';

export interface GroupMember {
	user: User;
	role: 'admin' | 'co-lead' | 'elder' | 'member';
	invitationStatus: 'pending' | 'accepted' | 'declined';
	addedBy: User | string;
	createdAt: string;
	updatedAt: string;
}

export interface Group {
	_id: string;
	name: string;
	imageUrl: string;
	members: GroupMember[];
	createdBy: User | string;
	createdAt: string;
	updatedAt: string;
}

export interface GroupInvitation {
	_id: string;
	name: string;
	imageUrl: string;
	createdBy: User;
	members: GroupMember[];
	createdAt: string;
	updatedAt: string;
}

export interface CreateGroupData {
	name: string;
	imageUrl?: string;
	invitees: { email: string }[];
}
