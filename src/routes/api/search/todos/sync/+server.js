import { json } from '@sveltejs/kit';
import { handleRequest } from '$backend/server.js';

export async function POST({ cookies }) {
    const token = cookies.get('jwt');
    if (!token) return json({ message: 'Not authorized' }, { status: 401 });

    // Forward to Express backend
    const result = await handleRequest(
        'POST',
        '/api/search/todos/sync',
        null,
        { Authorization: `Bearer ${token}` },
        { jwt: token }
    );

    return json(result.body, { status: result.status });
} 