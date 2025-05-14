import { handleRequest } from '$backend/server.js';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, cookies }) => {
	try {
		// Extract JWT token from cookies
		const token = cookies.get('jwt');
		console.log('GET /api/groups - JWT token from cookie:', token);

		// Create headers object
		const headers = new Headers(request.headers);

		// Add authorization header if token exists
		if (token) {
			headers.set('Authorization', `Bearer ${token}`);
			console.log(
				'GET /api/groups - Authorization header set:',
				`Bearer ${token.substring(0, 10)}...`
			);
		} else {
			console.log('GET /api/groups - No JWT token found in cookies');
		}

		const result = await handleRequest('GET', '/api/groups', null, headers, cookies);
		return json(result.body);
	} catch (err) {
		const error = err instanceof Error ? err : new Error('Unknown error occurred');
		console.error('Error fetching groups:', error);
		return json(
			{ success: false, message: error.message || 'Failed to fetch groups' },
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		// Extract JWT token from cookies
		const token = cookies.get('jwt');
		console.log('POST /api/groups - JWT token from cookie:', token ? 'Found token' : 'No token');

		// Create headers object
		const headers = new Headers(request.headers);

		// Add authorization header if token exists
		if (token) {
			headers.set('Authorization', `Bearer ${token}`);
			console.log(
				'POST /api/groups - Authorization header set:',
				`Bearer ${token.substring(0, 10)}...`
			);
		} else {
			console.log('POST /api/groups - No JWT token found in cookies');
		}

		const body = await request.json();
		const result = await handleRequest('POST', '/api/groups', body, headers, cookies);
		return json(result.body, { status: result.status });
	} catch (err) {
		const error = err instanceof Error ? err : new Error('Unknown error occurred');
		console.error('Error creating group:', error);
		return json(
			{ success: false, message: error.message || 'Failed to create group' },
			{ status: 500 }
		);
	}
};
