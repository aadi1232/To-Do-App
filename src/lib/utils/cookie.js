/**
 * Sets a cookie with proper options, ensuring the path is set
 * @param {import('@sveltejs/kit').Cookies} cookies - SvelteKit cookies object
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {Record<string, any>} options - Cookie options
 */
export function setCookieSafely(cookies, name, value, options = {}) {
	const safeOptions = {
		...options,
		path: options.path || '/'
	};

	cookies.set(name, value, safeOptions);
}

/**
 * Clears a cookie by setting it to empty with immediate expiration
 * @param {import('@sveltejs/kit').Cookies} cookies - SvelteKit cookies object
 * @param {string} name - Cookie name
 * @param {Record<string, any>} options - Cookie options
 */
export function clearCookie(cookies, name, options = {}) {
	const safeOptions = {
		...options,
		path: options.path || '/',
		expires: new Date(0)
	};

	cookies.set(name, '', safeOptions);
}
