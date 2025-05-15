import { handleRequest } from '$backend/server.js';
import { json, type RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ request, cookies, params }) => {
	try {
		// Extract parameters from the URL
		const { id: groupId, memberId } = params;
		console.log(`Processing member removal for group ${groupId}, member ${memberId}`);

		// Extract JWT token from cookies
		const token = cookies.get('jwt');

		// Create headers object
		const headers = new Headers(request.headers);

		// Add authorization header if token exists
		if (token) {
			headers.set('Authorization', `Bearer ${token}`);
		}

		// Forward to the backend controller with the correct URL
		const result = await handleRequest(
			'DELETE',
			`/api/groups/${groupId}/member/${memberId}`,
			{}, // Empty body for DELETE
			headers,
			cookies
		);

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
