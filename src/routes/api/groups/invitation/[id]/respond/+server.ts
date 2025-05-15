import { handleRequest } from '$backend/server.js';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies, params }) => {
	try {
		// Extract the group ID from the route parameters
		const groupId = params.id;

		if (!groupId) {
			return json({ success: false, message: 'Group ID is required' }, { status: 400 });
		}

		// Extract JWT token from cookies
		const token = cookies.get('jwt');

		// Create headers object
		const headers = new Headers(request.headers);

		// Add authorization header if token exists
		if (token) {
			headers.set('Authorization', `Bearer ${token}`);
		}

		const body = await request.json();
		const { response: responseType } = body;

		// IMPORTANT: The backend route expects the groupId in the request body
		// Looking at the controller: const { groupId, response } = req.body;
		const result = await handleRequest(
			'POST',
			'/api/groups/invitation/' + groupId + '/respond',
			{
				groupId, // Include groupId in the body as controller expects it
				response: responseType
			},
			headers,
			cookies
		);

		return json(result.body, { status: result.status });
	} catch (err) {
		const error = err instanceof Error ? err : new Error('Unknown error occurred');
		console.error('Error responding to invitation:', error);
		return json(
			{ success: false, message: error.message || 'Failed to respond to invitation' },
			{ status: 500 }
		);
	}
};
