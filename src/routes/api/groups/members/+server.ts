import { handleRequest } from '$backend/server.js';
import { json, type RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ request, cookies }) => {
	try {
		// Extract JWT token from cookies
		const token = cookies.get('jwt');

		// Create headers object
		const headers = new Headers(request.headers);

		// Add authorization header if token exists
		if (token) {
			headers.set('Authorization', `Bearer ${token}`);
		}

		const body = await request.json();
		const result = await handleRequest('DELETE', '/api/groups/members', body, headers, cookies);
		return json(result.body, { status: result.status });
	} catch (err) {
		const error = err instanceof Error ? err : new Error('Unknown error occurred');
		console.error('Error removing member:', error);
		return json(
			{ success: false, message: error.message || 'Failed to remove member' },
			{ status: 500 }
		);
	}
};
