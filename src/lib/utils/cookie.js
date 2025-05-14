/**
 * Sets a cookie with proper options, ensuring the path is set
 * @param {import('@sveltejs/kit').Cookies} cookies - SvelteKit cookies object
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {Record<string, any>} options - Cookie options
 */
export function setCookieSafely(cookies, name, value, options = {}) {
	console.log(`Setting cookie: ${name}`, options);

	const safeOptions = {
		...options,
		path: options.path || '/'
	};

	console.log(`Final cookie options for ${name}:`, safeOptions);

	try {
		cookies.set(name, value, safeOptions);
		console.log(`Cookie ${name} set successfully`);
	} catch (error) {
		console.error(`Error setting cookie ${name}:`, error);
	}
}

/**
 * Clears a cookie by setting it to empty with immediate expiration
 * @param {import('@sveltejs/kit').Cookies} cookies - SvelteKit cookies object
 * @param {string} name - Cookie name
 * @param {Record<string, any>} options - Cookie options
 */
export function clearCookie(cookies, name, options = {}) {
	console.log(`Clearing cookie: ${name}`);

	const safeOptions = {
		...options,
		path: options.path || '/',
		expires: new Date(0)
	};

	try {
		cookies.set(name, '', safeOptions);
		console.log(`Cookie ${name} cleared successfully`);
	} catch (error) {
		console.error(`Error clearing cookie ${name}:`, error);
	}
}
