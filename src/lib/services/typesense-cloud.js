import Typesense from 'typesense';

/**
 * Initialize Typesense client for cloud deployment
 * @returns {Typesense.Client} Typesense client instance
 */
export function getTypesenseClient() {
	// Default fallback values
	const apiKey = process.env.TYPESENSE_API_KEY || 'xyz';
	const host = process.env.TYPESENSE_HOST || 'localhost';
	const port = process.env.TYPESENSE_PORT || '8108';
	const protocol = process.env.TYPESENSE_PROTOCOL || 'http';

	// For Vercel deployment, you should use a cloud-hosted Typesense instance
	// Check for environment-specific configuration
	const isProduction = process.env.NODE_ENV === 'production';

	// Create Typesense client configuration
	const typesenseConfig = {
		nodes: [
			{
				host: host,
				port: port,
				protocol: protocol
			}
		],
		apiKey: apiKey,
		connectionTimeoutSeconds: 5,
		retryIntervalSeconds: 0.1
	};

	// For production, we recommend using Typesense Cloud
	if (isProduction) {
		console.log('Using cloud Typesense configuration for production');
	} else {
		console.log('Using local Typesense configuration for development');
	}

	// Initialize and return Typesense client
	return new Typesense.Client(typesenseConfig);
}

/**
 * Create necessary collections in Typesense
 * @param {Typesense.Client} client - Typesense client
 */
export async function initializeTypesenseCollections(client) {
	try {
		// Check if todos collection exists, create if not
		try {
			await client.collections('todos').retrieve();
			console.log('Todos collection already exists');
		} catch (err) {
			// Collection doesn't exist, create it
			const todosSchema = {
				name: 'todos',
				fields: [
					{ name: 'title', type: 'string' },
					{ name: 'description', type: 'string', optional: true },
					{ name: 'tags', type: 'string[]', optional: true },
					{ name: 'priority', type: 'string', optional: true },
					{ name: 'userId', type: 'string' },
					{ name: 'groupId', type: 'string', optional: true },
					{ name: 'completed', type: 'bool' },
					{ name: 'createdAt', type: 'int64' }
				],
				default_sorting_field: 'createdAt'
			};

			await client.collections().create(todosSchema);
			console.log('Successfully created todos collection');
		}

		return true;
	} catch (error) {
		console.error('Error initializing Typesense collections:', error);
		return false;
	}
}

/**
 * Initialize Typesense for the application
 * This function should be called during application startup
 */
export async function initTypesense() {
	try {
		const client = getTypesenseClient();
		const success = await initializeTypesenseCollections(client);

		if (success) {
			console.log('Typesense initialized successfully');
			return client;
		} else {
			console.error('Failed to initialize Typesense collections');
			return null;
		}
	} catch (error) {
		console.error('Typesense initialization error:', error);
		return null;
	}
}
