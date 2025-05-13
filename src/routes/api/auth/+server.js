import { json } from '@sveltejs/kit';
import { app } from '$backend/server.js';

// Register endpoint
export async function POST({ request }) {
	const requestData = await request.json();

	return new Promise((resolve) => {
		app._router.handle(
			{ method: 'POST', url: '/api/users/register', body: requestData, headers: {} },
			{
				status: (code) => ({
					json: (data) => {
						resolve(json(data, { status: code }));
						return { end: () => {} };
					},
					end: () => {
						resolve(json({}, { status: code }));
						return { end: () => {} };
					}
				}),
				setHeader: () => {
					return { status: () => {} };
				}
			}
		);
	});
}
