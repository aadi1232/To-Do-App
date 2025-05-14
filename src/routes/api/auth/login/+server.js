import { json } from '@sveltejs/kit';
import { handleRequest } from '$backend/server.js';
import { setCookieSafely } from '$lib/utils/cookie.js';

export async function POST({ request, cookies }) {
	try {
		// Get request data
		const requestData = await request.json();
		console.log('Login request data:', { username: requestData.username });

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

		console.log('Login response:', {
			status: result.status,
			cookies: result.cookies ? result.cookies.length : 0,
			body: result.body
				? {
						success: !!result.body.token,
						username: result.body.username
					}
				: null
		});

		// Set cookies if needed
		if (result.cookies && result.cookies.length > 0) {
			for (const cookie of result.cookies) {
				console.log(`Setting cookie from login response: ${cookie.name}`, cookie.options);
				setCookieSafely(cookies, cookie.name, cookie.value, cookie.options);
			}
		} else {
			console.log('No cookies received from login response');
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
