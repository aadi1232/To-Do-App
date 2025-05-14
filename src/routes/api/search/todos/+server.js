import { json } from '@sveltejs/kit';
import { handleRequest } from '$backend/server.js';

export async function GET({ url, cookies }) {
    const token = cookies.get('jwt');
    if (!token) return json({ message: 'Not authorized' }, { status: 401 });

    // Get query parameter and handle the :1 issue
    let rawQuery = url.searchParams.get('query');
    console.log('Raw query from URL:', rawQuery);
    
    // Check if query has a colon and number format (like "Work:1")
    if (rawQuery && rawQuery.includes(':')) {
        // Remove the colon and anything after it
        rawQuery = rawQuery.split(':')[0];
        console.log('Fixed query after removing colon:', rawQuery);
    }
    
    const query = rawQuery ? rawQuery.trim() : '';
    console.log('Final search query:', query);
    
    if (!query) {
        return json({ message: 'Search query is required' }, { status: 400 });
    }

    // Forward to Express backend
    try {
        const result = await handleRequest(
            'GET',
            `/api/search/todos?query=${encodeURIComponent(query)}`,
            null,
            { Authorization: `Bearer ${token}` },
            { jwt: token }
        );

        return json(result.body, { status: result.status });
    } catch (error) {
        console.error('Search API error:', error);
        return json({ message: 'Error processing search request', error: error.message }, { status: 500 });
    }
} 