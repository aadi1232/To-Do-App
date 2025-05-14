import { json } from '@sveltejs/kit';
import { handleRequest } from '$backend/server.js';

export async function POST({ url, cookies }) {
    const token = cookies.get('jwt');
    if (!token) return json({ message: 'Not authorized' }, { status: 401 });

    // Get groupId from URL
    const groupId = url.searchParams.get('groupId');
    if (!groupId) {
        return json({ message: 'Group ID is required' }, { status: 400 });
    }

    // Forward to Express backend
    try {
        const result = await handleRequest(
            'POST',
            `/api/search/todos/group/sync?groupId=${encodeURIComponent(groupId)}`,
            null,
            { Authorization: `Bearer ${token}` },
            { jwt: token }
        );

        return json(result.body, { status: result.status });
    } catch (error) {
        console.error('Group search sync API error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return json({ message: 'Error syncing group todos', error: errorMessage }, { status: 500 });
    }
} 