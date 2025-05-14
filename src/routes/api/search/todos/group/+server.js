import { json } from '@sveltejs/kit';
import { handleRequest } from '$backend/server.js';

export async function GET({ url, cookies }) {
    const token = cookies.get('jwt');
    if (!token) return json({ message: 'Not authorized' }, { status: 401 });

    // Get query parameter and handle the :1 issue
    let rawQuery = url.searchParams.get('query');
    console.log('Raw group search query from URL:', rawQuery);
    
    // Check if query has a colon and number format (like "Work:1")
    if (rawQuery && rawQuery.includes(':')) {
        // Remove the colon and anything after it
        rawQuery = rawQuery.split(':')[0];
        console.log('Fixed group search query after removing colon:', rawQuery);
    }
    
    const query = rawQuery ? rawQuery.trim() : '';
    console.log('Final group search query:', query);
    
    if (!query) {
        return json({ message: 'Search query is required' }, { status: 400 });
    }

    // Get groupId from URL
    const groupId = url.searchParams.get('groupId');
    if (!groupId) {
        return json({ message: 'Group ID is required' }, { status: 400 });
    }

    // Forward to Express backend
    try {
        const result = await handleRequest(
            'GET',
            `/api/search/todos/group?query=${encodeURIComponent(query)}&groupId=${encodeURIComponent(groupId)}`,
            null,
            { Authorization: `Bearer ${token}` },
            { jwt: token }
        );

        return json(result.body, { status: result.status });
    } catch (error) {
        console.error('Group search API error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return json({ message: 'Error processing group search request', error: errorMessage }, { status: 500 });
    }
} 