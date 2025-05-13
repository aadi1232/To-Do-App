import { json } from '@sveltejs/kit';

/** @type {Array<{ id: number, text: string, completed: boolean }>} */
let todos = ["create the group","Update the profile image"]; // This is temporary storage. In a real app, you'd use a database

export async function GET() {
	try {
		return json({
			status: 200,
			todos: todos
		});
	} catch (error) {
		return json(
			{
				status: 500,
				error: 'Failed to fetch todos'
			},
			{ status: 500 }
		);
	}
}
