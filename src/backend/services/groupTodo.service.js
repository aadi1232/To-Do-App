import Todo from '../models/todo.model.js';
import Group from '../models/group.model.js';

/**
 * Check if a user has access to a specific group
 * @param {string} userId - The user ID 
 * @param {string} groupId - The group ID
 * @returns {Promise<boolean>} Whether the user has access
 */
export async function userHasAccessToGroup(userId, groupId) {
  try {
    const group = await Group.findById(groupId);
    
    if (!group) {
      return false;
    }
    
    // Check if user is a member of the group
    const member = group.members.find(
      m => m.user.toString() === userId.toString() && m.invitationStatus === 'accepted'
    );
    
    return !!member;
  } catch (error) {
    console.error('Error checking group access:', error);
    return false;
  }
}

/**
 * Get all todos for a specific group
 * @param {string} groupId - The group ID
 * @returns {Promise<Array>} Array of todos
 */
export async function getTodosByGroup(groupId) {
  try {
    return await Todo.find({ group: groupId })
      .populate('createdBy', 'username email')
      .lean();
  } catch (error) {
    console.error('Error fetching group todos:', error);
    throw error;
  }
}

/**
 * Create a new todo in a group
 * @param {string} groupId - The group ID
 * @param {string} userId - The user ID creating the todo
 * @param {Object} todoData - The todo data
 * @returns {Promise<Object>} The created todo
 */
export async function createGroupTodo(groupId, userId, todoData) {
  try {
    const newTodo = new Todo({
      ...todoData,
      group: groupId,
      createdBy: userId
    });
    
    await newTodo.save();
    return newTodo;
  } catch (error) {
    console.error('Error creating group todo:', error);
    throw error;
  }
}

/**
 * Update a todo in a group
 * @param {string} todoId - The todo ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} The updated todo
 */
export async function updateGroupTodo(todoId, updateData) {
  try {
    const todo = await Todo.findByIdAndUpdate(
      todoId,
      { $set: updateData },
      { new: true }
    );
    
    return todo;
  } catch (error) {
    console.error('Error updating group todo:', error);
    throw error;
  }
}

/**
 * Delete a todo from a group
 * @param {string} todoId - The todo ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteGroupTodo(todoId) {
  try {
    await Todo.findByIdAndDelete(todoId);
    return true;
  } catch (error) {
    console.error('Error deleting group todo:', error);
    throw error;
  }
} 