import { json } from '@sveltejs/kit';

// This handles Chrome DevTools' special request for this file
// It's just to avoid seeing 404 errors in console logs
export function GET() {
	return json({
		version: 1,
		type: 'sveltekit'
	});
}
