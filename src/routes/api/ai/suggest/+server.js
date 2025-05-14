import { json } from '@sveltejs/kit';
import { handleRequest } from '../../../../backend/server.js';

export async function POST({ request, cookies, locals }) {
  try {
    // Extract the body from the request
    const body = await request.json();
    
    // Get cookie headers
    const cookieHeader = request.headers.get('cookie');
    const cookiesObj = {};
    
    if (cookieHeader) {
      cookieHeader.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        cookiesObj[name] = value;
      });
    }

    // Forward the request to our Express backend
    const result = await handleRequest(
      'POST',
      '/api/ai/suggest',
      body,
      request.headers,
      cookiesObj
    );

    // Setup response headers
    const headers = new Headers();
    Object.entries(result.headers || {}).forEach(([key, value]) => {
      headers.append(key, value);
    });

    // Handle cookies
    if (result.cookies && result.cookies.length > 0) {
      result.cookies.forEach(({ name, value, options }) => {
        cookies.set(name, value, options);
      });
    }

    // Return the response
    return json(result.body, {
      status: result.status,
      headers
    });
  } catch (error) {
    console.error('AI suggestion API error:', error);
    return json({ error: 'Failed to process request' }, { status: 500 });
  }
} 