import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		completed: { type: Boolean, default: false },
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
	},
	{ timestamps: true }
);

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;
