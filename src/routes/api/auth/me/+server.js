import { json } from '@sveltejs/kit';
import { handleRequest } from '$backend/server.js';

export async function GET({ cookies }) {
	const token = cookies.get('jwt');

	if (!token) {
		return json({ message: 'Not authorized, no token' }, { status: 401 });
	}

	try {
		// Use our handleRequest function to process the request
		const result = await handleRequest(
			'GET',
			'/api/users/me',
			null,
			{
				Authorization: `Bearer ${token}`
			},
			{ jwt: token }
		);

		// Return the response
		return json(result.body, { status: result.status });
	} catch (error) {
		console.error('Profile fetch error:', error);
		return json(
			{
				message: error instanceof Error ? error.message : 'An error occurred while fetching profile'
			},
			{ status: 500 }
		);
	}
}
