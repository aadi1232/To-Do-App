import { createServer } from 'http';
import { handler } from '../build/handler.js';

// Create a simple HTTP server
const server = createServer((req, res) => {
	return handler(req, res);
});

// Export for Vercel
export default function vercelHandler(req, res) {
	return handler(req, res);
}
