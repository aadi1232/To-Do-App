import express from 'express';
import cookieParser from 'cookie-parser';
import connectDB, { dbState } from './db/db.js';
import userRoutes from './routes/user.routes.js';
import todoRoutes from './routes/todo.routes.js';
import aiRoutes from './routes/ai.routes.js';

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Add middleware to check database connection
app.use((req, res, next) => {
	if (!dbState.isConnected) {
		// Return database error for all routes except auth
		if (dbState.error) {
			return res.status(503).json({
				message: 'Database unavailable',
				error: dbState.error
			});
		}
	}
	next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/ai', aiRoutes);

// Not found handler
app.use((req, res, next) => {
	const error = new Error(`Not Found - ${req.originalUrl}`);
	res.status(404);
	next(error);
});

// Error handler
app.use((err, req, res, next) => {
	const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
	res.status(statusCode);
	res.json({
		message: err.message,
		stack: process.env.NODE_ENV === 'production' ? null : err.stack
	});
});

// Connect to MongoDB when the app is first imported
let dbConnectPromise = null;
async function ensureDbConnected() {
	if (!dbConnectPromise) {
		dbConnectPromise = connectDB().catch((err) => {
			console.error('Failed to connect to MongoDB', err);
			// Clear the promise so we can try again next time
			dbConnectPromise = null;
		});
	}
	return dbConnectPromise;
}

// Handler for SvelteKit endpoints to call Express
export async function handleRequest(method, url, body, headers, cookies) {
	// Try to connect to DB but don't wait for it
	ensureDbConnected().catch(() => {}); // Ignore connection errors

	return new Promise((resolve, reject) => {
		// Create mock request and response objects
		const req = {
			method,
			url,
			body,
			headers: headers || {},
			cookies: cookies || {},
			// Add methods needed by Express
			get: function (headerName) {
				return this.headers[headerName.toLowerCase()];
			},
			// Add express's expected properties
			path: url,
			originalUrl: url,
			query: {},
			params: {},
			socket: {
				remoteAddress: '127.0.0.1'
			}
		};

		const res = {
			statusCode: 200,
			_status: 200,
			_headers: {},
			_body: null,
			_cookies: [],

			status(code) {
				this._status = code;
				this.statusCode = code;
				return this;
			},

			set(header, value) {
				this._headers[header] = value;
				return this;
			},

			setHeader(header, value) {
				this._headers[header] = value;
				return this;
			},

			getHeader(header) {
				return this._headers[header];
			},

			cookie(name, value, options) {
				// This will be captured and handled by the SvelteKit endpoint
				// Ensure a path is set
				const cookieOptions = {
					...options,
					path: options?.path || '/'
				};
				this._cookies.push({ name, value, options: cookieOptions });
				return this;
			},

			json(body) {
				this._body = body;
				this._headers['Content-Type'] = 'application/json';

				// Resolve the promise with the response data
				resolve({
					status: this._status,
					headers: this._headers,
					body: this._body,
					cookies: this._cookies
				});

				return this;
			},

			send(body) {
				this._body = body;

				resolve({
					status: this._status,
					headers: this._headers,
					body: this._body,
					cookies: this._cookies
				});

				return this;
			},

			end() {
				resolve({
					status: this._status,
					headers: this._headers,
					body: this._body,
					cookies: this._cookies
				});

				return this;
			}
		};

		// Handle paths specially when DB is down
		if (!dbState.isConnected) {
			// Add mock functionality for auth paths
			if (url.startsWith('/api/users/register') || url.startsWith('/api/users/login')) {
				return resolve({
					status: 503,
					body: {
						message: 'Service temporarily unavailable',
						error: 'Database connection failed. Please try again later.'
					}
				});
			}
		}

		// Dispatch the request to the Express app
		try {
			app(req, res, (err) => {
				if (err) {
					reject(err);
				}

				// If we reach this point, it means no route handled the request
				resolve({
					status: 404,
					body: { message: 'Not found' }
				});
			});
		} catch (error) {
			console.error('Express app error:', error);
			reject(error);
		}
	});
}

export { app };
