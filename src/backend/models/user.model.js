import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			trim: true
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true
		},
		password: {
			type: String,
			required: true
		},
		profileImage: {
			type: String,
			default: ''
		}
	},
	{
		timestamps: true
	}
);

// Generate initial profile image based on username
userSchema.pre('save', function (next) {
	if (this.isNew || this.isModified('username')) {
		const nameParts = this.username.split(/\s+/);
		let initials = '';

		if (nameParts.length === 1) {
			initials = nameParts[0].charAt(0).toUpperCase();
		} else {
			initials = nameParts.reduce((acc, part) => acc + part.charAt(0).toUpperCase(), '');
		}

		this.profileImage = initials.slice(0, 2);
	}
	next();
});

// Hash password before saving to database
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		return next();
	}
	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
