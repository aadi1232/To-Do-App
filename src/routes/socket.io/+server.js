/**
 * Socket.IO connection endpoint for SvelteKit
 * This is just a placeholder endpoint for Socket.IO to connect to
 * The actual socket connection is managed in the hooks.server.js file
 */
export function GET() {
	// Return 200 OK, the Socket.IO server in hooks.server.js handles the upgrade
	return new Response('Socket.IO endpoint', { status: 200 });
}
