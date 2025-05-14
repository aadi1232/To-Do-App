import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
	{
		recipient: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		type: {
			type: String,
			enum: ['group_invitation', 'todo_assigned', 'todo_completed', 'role_changed', 'group_update'],
			required: true
		},
		message: {
			type: String,
			required: true
		},
		group: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Group',
			default: null
		},
		todo: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Todo',
			default: null
		},
		actor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			default: null
		},
		read: {
			type: Boolean,
			default: false
		}
	},
	{ timestamps: true }
);

// Adding an index on recipient and read status for faster queries
notificationSchema.index({ recipient: 1, read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
