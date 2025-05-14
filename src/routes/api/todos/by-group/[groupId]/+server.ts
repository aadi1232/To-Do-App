import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { handleRequest } from '$backend/server.js';

export const GET: RequestHandler = async ({ params, cookies }) => {
	const { groupId } = params;
	const token = cookies.get('jwt');

	if (!token) return json({ message: 'Not authorized' }, { status: 401 });

	const result = await handleRequest(
		'GET',
		`/api/todos/by-group/${groupId}`,
		null,
		{ Authorization: `Bearer ${token}` },
		{ jwt: token }
	);

	return json(result.body, { status: result.status });
};

export const POST: RequestHandler = async ({ params, request, cookies }) => {
	const { groupId } = params;
	const token = cookies.get('jwt');

	if (!token) return json({ message: 'Not authorized' }, { status: 401 });

	const data = await request.json();

	const result = await handleRequest(
		'POST',
		`/api/todos/by-group/${groupId}`,
		data,
		{
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		{ jwt: token }
	);

	return json(result.body, { status: result.status });
};
