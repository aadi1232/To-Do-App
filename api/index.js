// API index handler for Vercel
export default function handler(req, res) {
	res.status(200).json({
		status: 'success',
		message: 'To-Do App API is running',
		endpoints: ['/api/socket.io', '/api/server']
	});
}
