// src/backend/controllers/notification.controller.js
import Notification from '../models/notification.model.js';
import Group from '../models/group.model.js';
import * as socketService from '../services/socket.service.js';

/**
 * Create notifications for all group members
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function notifyGroupMembers(req, res) {
	try {
		const { groupId, type, message, todoId, todoTitle } = req.body;

		// Find the group to get its members
		const group = await Group.findById(groupId);
		if (!group) {
			return res.status(404).json({ message: 'Group not found' });
		}

		const createdNotifications = [];

		// Create a notification for each group member except the sender
		for (const member of group.members) {
			// Skip creating notification for the sender
			if (member.user.toString() === req.user._id.toString()) {
				continue;
			}

			// Skip pending invitations
			if (member.invitationStatus !== 'accepted') {
				continue;
			}

			// Create the notification in the database
			const notification = await Notification.create({
				recipient: member.user,
				sender: req.user._id,
				type,
				message,
				relatedGroup: groupId,
				relatedTodo: todoId,
				data: {
					groupName: group.name,
					todoTitle,
					senderName: req.user.username
				}
			});

			createdNotifications.push(notification);

			// Also send real-time notification if user is online
			socketService.notifyUser(member.user.toString(), type, {
				notification: notification._id,
				message,
				groupId,
				groupName: group.name,
				todoTitle,
				userName: req.user.username,
				timestamp: new Date().toISOString()
			});
		}

		res.status(201).json({
			success: true,
			count: createdNotifications.length,
			notifications: createdNotifications
		});
	} catch (err) {
		console.error('Error creating notifications:', err);
		res.status(500).json({ message: 'Failed to create notifications' });
	}
}

/**
 * Get notifications for the current user
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getUserNotifications(req, res) {
	try {
		const notifications = await Notification.find({ recipient: req.user._id })
			.sort({ createdAt: -1 })
			.limit(50)
			.populate('sender', 'username profileImage')
			.populate('relatedGroup', 'name')
			.exec();

		res.status(200).json(notifications);
	} catch (err) {
		console.error('Error fetching notifications:', err);
		res.status(500).json({ message: 'Failed to fetch notifications' });
	}
}

/**
 * Mark a notification as read
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function markAsRead(req, res) {
	try {
		const { notificationId } = req.params;

		const result = await Notification.updateOne(
			{ _id: notificationId, recipient: req.user._id },
			{ read: true }
		);

		if (result.matchedCount === 0) {
			return res.status(404).json({ message: 'Notification not found' });
		}

		res.status(200).json({ success: true });
	} catch (err) {
		console.error('Error marking notification as read:', err);
		res.status(500).json({ message: 'Failed to update notification' });
	}
}

/**
 * Mark all notifications as read
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function markAllAsRead(req, res) {
	try {
		await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });

		res.status(200).json({ success: true });
	} catch (err) {
		console.error('Error marking all notifications as read:', err);
		res.status(500).json({ message: 'Failed to update notifications' });
	}
}
