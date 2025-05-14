import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		role: {
			type: String,
			enum: ['admin', 'co-lead', 'elder', 'member'],
			default: 'member'
		},
		invitationStatus: {
			type: String,
			enum: ['pending', 'accepted', 'declined'],
			default: 'pending'
		},
		addedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}
	},
	{ timestamps: true }
);

const groupSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true
		},
		imageUrl: {
			type: String,
			default: ''
		},
		members: [memberSchema],
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		}
	},
	{ timestamps: true }
);

// Generate a default group image based on group name if none provided
groupSchema.pre('save', function (next) {
	if (this.isNew && !this.imageUrl) {
		const nameParts = this.name.split(/\s+/);
		let initials = '';

		if (nameParts.length === 1) {
			initials = nameParts[0].charAt(0).toUpperCase();
		} else {
			initials = nameParts.reduce((acc, part) => acc + part.charAt(0).toUpperCase(), '');
		}

		this.imageUrl = initials.slice(0, 2);
	}
	next();
});

const Group = mongoose.model('Group', groupSchema);

export default Group;
