import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		completed: { type: Boolean, default: false },
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		textColor: { type: String, default: '#000000' },
		isHighlighted: { type: Boolean, default: false },
		deadline: { type: String, enum: ['today', 'tomorrow', 'later', null], default: null },
		taggedMembers: [{ 
			type: mongoose.Schema.Types.ObjectId, 
			ref: 'User'
		}]
	},
	{ timestamps: true }
);

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;
