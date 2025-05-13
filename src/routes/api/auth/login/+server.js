import { json } from '@sveltejs/kit';
import { handleRequest } from '$backend/server.js';
import { setCookieSafely } from '$lib/utils/cookie.js';

export async function POST({ request, cookies }) {
	try {
		// Get request data
		const requestData = await request.json();

		// Use our handleRequest function to process the request
		const result = await handleRequest(
			'POST',
			'/api/users/login',
			requestData,
			{
				'Content-Type': 'application/json'
			},
			{} // No cookies to send initially
		);

		// Set cookies if needed
		if (result.cookies && result.cookies.length > 0) {
			for (const cookie of result.cookies) {
				setCookieSafely(cookies, cookie.name, cookie.value, cookie.options);
			}
		}

		// Return the response
		return json(result.body, { status: result.status });
	} catch (error) {
		console.error('Login error:', error);
		return json(
			{ message: error instanceof Error ? error.message : 'An error occurred during login' },
			{ status: 500 }
		);
	}
}
