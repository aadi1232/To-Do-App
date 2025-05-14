import express from 'express';
import cookieParser from 'cookie-parser';
import { Readable } from 'stream';
import connectDB, { dbState } from './db/db.js';
import userRoutes from './routes/user.routes.js';
import todoRoutes from './routes/todo.routes.js';
import groupRoutes from './routes/group.routes.js';
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

app.use('/api/groups', groupRoutes);
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
	// Ensure DB connection
	ensureDbConnected().catch(() => {});

	console.log(`handleRequest: ${method} ${url}`);

	// Log information about the request
	if (headers instanceof Headers) {
		console.log(
			'Headers provided:',
			Object.fromEntries(
				[...headers.entries()].filter(([k]) => k !== 'cookie' && k !== 'authorization')
			)
		);
		const authHeader = headers.get('authorization');
		if (authHeader) {
			console.log('Authorization header present:', authHeader.substring(0, 15) + '...');
		} else {
			console.log('Authorization header not present');
		}
	} else {
		console.log(
			'Headers provided:',
			Object.entries(headers || {})
				.filter(([k]) => k.toLowerCase() !== 'cookie' && k.toLowerCase() !== 'authorization')
				.reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {})
		);

		if (headers && headers.authorization) {
			console.log('Authorization header present:', headers.authorization.substring(0, 15) + '...');
		} else if (headers && headers.Authorization) {
			console.log('Authorization header present:', headers.Authorization.substring(0, 15) + '...');
		} else {
			console.log('Authorization header not present');
		}
	}

	// Extract JWT from cookies if available
	let jwtToken = null;
	const cookieObj = {};

	if (cookies && typeof cookies.get === 'function') {
		try {
			jwtToken = cookies.get('jwt');
			if (jwtToken) {
				cookieObj.jwt = jwtToken;
				console.log('JWT token extracted from cookies');
			}
		} catch (error) {
			console.error('Error extracting jwt cookie:', error);
		}
	} else if (typeof cookies === 'object') {
		Object.assign(cookieObj, cookies);
		if (cookies.jwt) {
			jwtToken = cookies.jwt;
		}
	}

	// Prepare headers with proper Authorization if needed
	let finalHeaders = {};

	if (headers instanceof Headers) {
		finalHeaders = Object.fromEntries([...headers.entries()]);
	} else {
		finalHeaders = headers || {};
	}

	// Add Authorization header if we have JWT token
	if (jwtToken && !finalHeaders.authorization && !finalHeaders.Authorization) {
		finalHeaders.authorization = `Bearer ${jwtToken}`;
		finalHeaders.Authorization = `Bearer ${jwtToken}`;
		console.log('Added Authorization header from cookies jwt');
	}

	console.log('Cookies prepared:', Object.keys(cookieObj));

	return new Promise((resolve, reject) => {
		let reqBody = null;

		const req = Object.assign(Readable.from([]), {
			method,
			url,
			headers: finalHeaders,
			cookies: cookieObj,
			// Initialize with empty body
			body: null,
			// Add _body property to indicate if body is parsed
			_body: false,
			get(headerName) {
				return this.headers[headerName.toLowerCase()];
			},
			path: url,
			originalUrl: url,
			query: {},
			params: {},
			socket: {
				remoteAddress: '127.0.0.1'
			}
		});

		// Patch for POST/PUT: simulate a real stream
		if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
			// For API requests, ensure we handle the body properly
			const isApiRequest = url.startsWith('/api/');

			// Convert body to JSON string if it's an object
			let bodyContent = body;
			if (typeof body === 'object' && !(body instanceof Buffer) && !(body instanceof Uint8Array)) {
				bodyContent = JSON.stringify(body);
			}

			// Create a proper stream with the body content
			const stream = Readable.from([bodyContent]);
			Object.assign(req, stream);

			// Set content-type and length headers
			req.headers['content-type'] = 'application/json';
			req.headers['content-length'] = String(Buffer.byteLength(bodyContent));

			// For ALL API requests, pre-parse the body
			if (isApiRequest) {
				// We need to make sure the body is parsed right away for all API endpoints
				// This prevents "Cannot destructure property of undefined" errors
				if (typeof bodyContent === 'string') {
					try {
						// Pre-parse the body and add it directly to the request
						req.body = JSON.parse(bodyContent);
						console.log(`Pre-parsed JSON body for ${url}`);
					} catch (err) {
						console.error(`Failed to pre-parse JSON body for ${url}:`, err);
					}
				} else {
					req.body = body;
				}

				// Flag that we've already parsed the body
				req._body = true;

				// Log body content for debugging (mask password fields)
				const debugBody = { ...req.body };
				if (debugBody.password) debugBody.password = '***';
				console.log(`Request body for ${url}:`, debugBody);
			}
		}

		// Log request details
		console.log('Created mock request with:', {
			url: req.url,
			method: req.method,
			hasCookies: Object.keys(req.cookies).length > 0,
			hasAuth: !!req.headers.authorization || !!req.headers.Authorization,
			hasJwtCookie: !!req.cookies.jwt,
			cookieKeys: Object.keys(req.cookies),
			authHeaderValue:
				req.headers.authorization || req.headers.Authorization
					? `${(req.headers.authorization || req.headers.Authorization).substring(0, 15)}...`
					: 'none'
		});

		// Create a response object
		const res = {
			statusCode: 200,
			_headers: {},
			_body: null,
			_cookies: [],

			status(code) {
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
				resolve({
					status: this.statusCode,
					headers: this._headers,
					body: this._body,
					cookies: this._cookies
				});
			},

			send(body) {
				this._body = body;
				resolve({
					status: this.statusCode,
					headers: this._headers,
					body: this._body,
					cookies: this._cookies
				});
			},

			end() {
				resolve({
					status: this.statusCode,
					headers: this._headers,
					body: this._body,
					cookies: this._cookies
				});
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

		try {
			app(req, res, (err) => {
				if (err) {
					console.error('Express middleware error:', err);
					reject(err);
				} else {
					// If we reach this point, it means no route handled the request
					resolve({
						status: 404,
						body: { message: 'Not found' }
					});
				}
			});
		} catch (error) {
			console.error('Express app error:', error);
			reject(error);
		}
	});
}

export { app };
