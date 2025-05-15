import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
	{
		recipient: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		type: {
			type: String,
			required: true,
			enum: ['todo:added', 'todo:deleted', 'todo:completed', 'group:invite', 'group:join']
		},
		read: {
			type: Boolean,
			default: false
		},
		message: String,
		relatedGroup: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Group'
		},
		relatedTodo: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Todo'
		},
		data: Object
	},
	{ timestamps: true }
);

// Adding an index on recipient and read status for faster queries
notificationSchema.index({ recipient: 1, read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
