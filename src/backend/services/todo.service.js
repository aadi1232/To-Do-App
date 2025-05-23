import Todo from '../models/todo.model.js';
import Group from '../models/group.model.js';
import * as typesenseService from './typesense.service.js';

export async function createTodo(userId, data) {
	const todoData = {
		...data,
		user: userId,
		createdBy: userId
	};

	const todo = await Todo.create(todoData);

	// Index the todo in Typesense
	try {
		await typesenseService.indexTodo(todo);
	} catch (error) {
		console.error('Failed to index todo in Typesense:', error);
		// We don't throw here to avoid disrupting the main flow
	}

	return todo;
}

export async function getTodosByUser(userId) {
	return await Todo.find({ user: userId, group: null }).sort({ createdAt: -1 });
}

export async function getTodoById(userId, todoId) {
	const todo = await Todo.findOne({ 
		_id: todoId, 
		user: userId,
		group: null
	});
	
	return todo;
}

export async function updateTodo(userId, todoId, data) {
	const todo = await Todo.findOne({ _id: todoId, user: userId });

	if (!todo) {
		throw new Error('Todo not found');
	}

	Object.assign(todo, data);
	const updatedTodo = await todo.save();

	// Update the todo in Typesense
	try {
		await typesenseService.indexTodo(updatedTodo);
	} catch (error) {
		console.error('Failed to update todo in Typesense:', error);
	}

	return updatedTodo;
}

export async function deleteTodo(userId, todoId) {
	const todo = await Todo.findOne({ _id: todoId, user: userId });

	if (!todo) {
		throw new Error('Todo not found');
	}

	
	// Use deleteOne instead of remove
	await Todo.deleteOne({ _id: todoId });
	

	


	try {
		await typesenseService.deleteTodoFromIndex(todoId);
	} catch (error) {
		console.error('Failed to delete todo from Typesense:', error);
	}

	return { message: 'Todo deleted successfully' };
}

export async function createGroupTodo(userId, groupId, data) {
	// Check if user is a member of the group with appropriate permissions
	const group = await Group.findOne({
		_id: groupId,
		'members.user': userId,
		'members.invitationStatus': 'accepted'
	});

	if (!group) {
		throw new Error('Group not found or you are not a member');
	}

	// Find user's role in the group
	const userMember = group.members.find((member) => member.user.toString() === userId.toString());

	if (!userMember) {
		throw new Error('You are not a member of this group');
	}

	// Check permissions based on role
	if (userMember.role === 'member') {
		throw new Error('You do not have permission to create todos in this group');
	}

	// Validate tagged members if provided
	if (data.taggedMembers && data.taggedMembers.length > 0) {
		// Convert array if it's a single string
		if (typeof data.taggedMembers === 'string') {
			data.taggedMembers = [data.taggedMembers];
		}
		
		// Verify all tagged members are actually in the group
		const groupMemberIds = group.members
			.filter(m => m.invitationStatus === 'accepted')
			.map(m => m.user.toString());
		
		const validTaggedMembers = data.taggedMembers.filter(memberId => 
			groupMemberIds.includes(memberId.toString())
		);
		
		data.taggedMembers = validTaggedMembers;
	}

	const todoData = {
		...data,
		user: userId,
		group: groupId,
		createdBy: userId
	};

	return await Todo.create(todoData);
}

export async function getGroupTodos(userId, groupId) {
	// Check if user is a member of the group
	const group = await Group.findOne({
		_id: groupId,
		'members.user': userId,
		'members.invitationStatus': 'accepted'
	});

	if (!group) {
		throw new Error('Group not found or you are not a member');
	}

	// Find the user's role in the group
	const userMember = group.members.find((member) => member.user.toString() === userId.toString());
	const isAdmin = ['admin', 'co-lead', 'elder'].includes(userMember.role);

	// Construct the query - either:
	// 1. The user is admin/co-lead/elder and can see all todos
	// 2. The user is the creator of the todo
	// 3. The user is tagged in the todo
	let query = { 
		group: groupId,
		$or: [
			{ createdBy: userId },
			{ taggedMembers: userId }
		]
	};

	// If user is admin or higher role, they can see all todos
	if (isAdmin) {
		query = { group: groupId };
	}

	return await Todo.find(query)
		.sort({ createdAt: -1 })
		.populate('createdBy', 'username email profileImage')
		.populate('taggedMembers', 'username email profileImage');
}

export async function updateGroupTodo(userId, todoId, data) {
	const todo = await Todo.findById(todoId);

	if (!todo) {
		throw new Error('Todo not found');
	}

	if (!todo.group) {
		throw new Error('This is not a group todo');
	}

	// Check if user is a member of the group with appropriate permissions
	const group = await Group.findOne({
		_id: todo.group,
		'members.user': userId,
		'members.invitationStatus': 'accepted'
	});

	if (!group) {
		throw new Error('Group not found or you are not a member');
	}

	// Find user's role in the group
	const userMember = group.members.find((member) => member.user.toString() === userId.toString());

	// Check permissions based on role
	if (userMember.role === 'member') {
		throw new Error('You do not have permission to update todos in this group');
	}

	Object.assign(todo, data);
	return await todo.save();
}

export async function deleteGroupTodo(userId, todoId) {
	const todo = await Todo.findById(todoId);

	if (!todo) {
		throw new Error('Todo not found');
	}

	if (!todo.group) {
		throw new Error('This is not a group todo');
	}

	// Check if user is a member of the group with appropriate permissions
	const group = await Group.findOne({
		_id: todo.group,
		'members.user': userId,
		'members.invitationStatus': 'accepted'
	});

	if (!group) {
		throw new Error('Group not found or you are not a member');
	}

	// Find user's role in the group
	const userMember = group.members.find((member) => member.user.toString() === userId.toString());

	// Check permissions based on role
	if (userMember && userMember.role === 'member') {
		throw new Error('You do not have permission to delete todos in this group');
	}


	// Use deleteOne instead of remove
	await Todo.deleteOne({ _id: todoId });
	
	return { message: 'Todo deleted successfully' };

	// Store todo information for return value
	const todoData = {
		_id: todo._id,
		title: todo.title,
		completed: todo.completed,
		group: todo.group
	};

	// Delete the todo
	await Todo.deleteOne({ _id: todoId });

	// Delete from Typesense if applicable
	try {
		await typesenseService.deleteGroupTodoFromIndex(todoId);
	} catch (error) {
		console.error('Failed to delete todo from Typesense:', error);
		// We don't throw here to avoid disrupting the main flow
	}

	
	return todoData;
}
