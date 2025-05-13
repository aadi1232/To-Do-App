import { json } from '@sveltejs/kit';
import { handleRequest } from '$backend/server.js';

export async function PUT({ request, cookies }) {
	try {
		// Get request data
		const requestData = await request.json();

		if (!requestData.profileImage) {
			return json({ message: 'Profile image URL is required' }, { status: 400 });
		}

		// Use our handleRequest function to process the request
		const result = await handleRequest(
			'PUT',
			'/api/users/profile/image',
			requestData,
			{
				'Content-Type': 'application/json'
			},
			{ jwt: cookies.get('jwt') || '' }
		);

		// Return the response
		return json(result.body || { message: 'Profile image updated successfully' }, {
			status: result.status || 200
		});
	} catch (error) {
		console.error('Profile image update error:', error);
		return json(
			{
				message: error instanceof Error ? error.message : 'An error occurred updating profile image'
			},
			{ status: 500 }
		);
	}
}
