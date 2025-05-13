import { json } from '@sveltejs/kit';
import { handleRequest } from '$backend/server.js';
import { clearCookie } from '$lib/utils/cookie.js';

export async function POST({ cookies }) {
	try {
		// Use our handleRequest function to process the request
		const result = await handleRequest(
			'POST',
			'/api/users/logout',
			null,
			{},
			{ jwt: cookies.get('jwt') || '' }
		);

		// Clear JWT cookie
		clearCookie(cookies, 'jwt', { httpOnly: true });

		// Return the response
		return json(result.body || { message: 'Logged out successfully' }, {
			status: result.status || 200
		});
	} catch (error) {
		console.error('Logout error:', error);

		// Still clear the cookie even if there's an error
		clearCookie(cookies, 'jwt', { httpOnly: true });

		return json({ message: 'Logged out successfully' }, { status: 200 });
	}
}
