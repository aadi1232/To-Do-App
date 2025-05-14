import { handleRequest } from '$backend/server.js';
import { json, type RequestHandler } from '@sveltejs/kit';

export const PUT: RequestHandler = async ({ request, cookies }) => {
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
		const result = await handleRequest('PUT', '/api/groups/members/role', body, headers, cookies);
		return json(result.body, { status: result.status });
	} catch (err) {
		const error = err instanceof Error ? err : new Error('Unknown error occurred');
		console.error('Error updating member role:', error);
		return json(
			{ success: false, message: error.message || 'Failed to update member role' },
			{ status: 500 }
		);
	}
};
