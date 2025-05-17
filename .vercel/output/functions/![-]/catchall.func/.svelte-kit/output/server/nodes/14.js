import * as server from '../entries/pages/shared/group/_id_/_page.server.js';

export const index = 14;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/shared/group/_id_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/shared/group/[id]/+page.server.js";
export const imports = ["_app/immutable/nodes/14.D7VrDyRt.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/69_IOA4Y.js","_app/immutable/chunks/DIeogL5L.js","_app/immutable/chunks/PWWI3Ue3.js","_app/immutable/chunks/BC15lkC2.js","_app/immutable/chunks/BsCQza_p.js","_app/immutable/chunks/FrGZEVpv.js","_app/immutable/chunks/CjOiFDoo.js","_app/immutable/chunks/DBYvBCBS.js","_app/immutable/chunks/BEc5jUYy.js","_app/immutable/chunks/LNgpw9vD.js","_app/immutable/chunks/6avubi_o.js","_app/immutable/chunks/CNzxuJyc.js"];
export const stylesheets = [];
export const fonts = [];
