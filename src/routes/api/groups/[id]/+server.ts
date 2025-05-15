import { handleRequest } from '$backend/server.js';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, request, cookies }) => {
	try {
		// Extract JWT token from cookies
		const token = cookies.get('jwt');

		// Create headers object
		const headers = new Headers(request.headers);

		// Add authorization header if token exists
		if (token) {
			headers.set('Authorization', `Bearer ${token}`);
		}

		const result = await handleRequest('GET', `/api/groups/${params.id}`, null, headers, cookies);
		return json(result.body, { status: result.status });
	} catch (err) {
		const error = err instanceof Error ? err : new Error('Unknown error occurred');
		console.error(`Error fetching group ${params.id}:`, error);
		return json(
			{ success: false, message: error.message || 'Failed to fetch group' },
			{ status: 500 }
		);
	}
};

export const PUT: RequestHandler = async ({ params, request, cookies }) => {
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
		const result = await handleRequest('PUT', `/api/groups/${params.id}`, body, headers, cookies);
		return json(result.body, { status: result.status });
	} catch (err) {
		const error = err instanceof Error ? err : new Error('Unknown error occurred');
		console.error(`Error updating group ${params.id}:`, error);
		return json(
			{ success: false, message: error.message || 'Failed to update group' },
			{ status: 500 }
		);
	}
};

export const DELETE: RequestHandler = async ({ params, request, cookies }) => {
	try {
		// Extract JWT token from cookies
		const token = cookies.get('jwt');

		// Create headers object
		const headers = new Headers(request.headers);

		// Add authorization header if token exists
		if (token) {
			headers.set('Authorization', `Bearer ${token}`);
		}

		// Make the request to the backend
		const result = await handleRequest(
			'DELETE',
			`/api/groups/${params.id}`,
			{}, // Empty body since we're using browser confirm dialog
			headers,
			cookies
		);

		return json(result.body, { status: result.status });
	} catch (err) {
		const error = err instanceof Error ? err : new Error('Unknown error occurred');
		console.error(`Error deleting group ${params.id}:`, error);
		return json(
			{ success: false, message: error.message || 'Failed to delete group' },
			{ status: 500 }
		);
	}
};
