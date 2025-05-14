import { json } from '@sveltejs/kit';
import { handleRequest } from '$backend/server.js';

// Forward the request to the backend API
export async function GET({ params }) {
	try {
		console.log('Fetching shared group with ID:', params.id);

		// Call the Express backend directly
		const result = await handleRequest('GET', `/api/groups/shared/${params.id}`, null, {
			'Content-Type': 'application/json'
		});

		return json(result.body);
	} catch (error) {
		console.error('Error in shared group API route:', error);
		return json({ success: false, message: 'Failed to fetch shared group' }, { status: 500 });
	}
}
