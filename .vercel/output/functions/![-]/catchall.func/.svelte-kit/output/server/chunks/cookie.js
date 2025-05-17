function setCookieSafely(cookies, name, value, options = {}) {
  console.log(`Setting cookie: ${name}`, options);
  const safeOptions = {
    ...options,
    path: options.path || "/"
  };
  console.log(`Final cookie options for ${name}:`, safeOptions);
  try {
    cookies.set(name, value, safeOptions);
    console.log(`Cookie ${name} set successfully`);
  } catch (error) {
    console.error(`Error setting cookie ${name}:`, error);
  }
}
function clearCookie(cookies, name, options = {}) {
  console.log(`Clearing cookie: ${name}`);
  const safeOptions = {
    ...options,
    path: options.path || "/",
    expires: /* @__PURE__ */ new Date(0)
  };
  try {
    cookies.set(name, "", safeOptions);
    console.log(`Cookie ${name} cleared successfully`);
  } catch (error) {
    console.error(`Error clearing cookie ${name}:`, error);
  }
}
export {
  clearCookie as c,
  setCookieSafely as s
};
