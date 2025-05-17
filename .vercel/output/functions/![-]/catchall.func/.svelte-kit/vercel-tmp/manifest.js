export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","notification.mp3"]),
	mimeTypes: {".png":"image/png",".mp3":"audio/mpeg"},
	_: {
		client: {start:"_app/immutable/entry/start.CPaYRc8i.js",app:"_app/immutable/entry/app.Byt23sVL.js",imports:["_app/immutable/entry/start.CPaYRc8i.js","_app/immutable/chunks/C5OadaZi.js","_app/immutable/chunks/PWWI3Ue3.js","_app/immutable/chunks/DIeogL5L.js","_app/immutable/chunks/CNzxuJyc.js","_app/immutable/chunks/D93VaLay.js","_app/immutable/entry/app.Byt23sVL.js","_app/immutable/chunks/PWWI3Ue3.js","_app/immutable/chunks/DIeogL5L.js","_app/immutable/chunks/BC15lkC2.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/BsCQza_p.js","_app/immutable/chunks/LNgpw9vD.js","_app/immutable/chunks/6avubi_o.js","_app/immutable/chunks/CNzxuJyc.js","_app/immutable/chunks/D93VaLay.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js')),
			__memo(() => import('../output/server/nodes/3.js')),
			__memo(() => import('../output/server/nodes/4.js')),
			__memo(() => import('../output/server/nodes/5.js')),
			__memo(() => import('../output/server/nodes/6.js')),
			__memo(() => import('../output/server/nodes/7.js')),
			__memo(() => import('../output/server/nodes/8.js')),
			__memo(() => import('../output/server/nodes/9.js')),
			__memo(() => import('../output/server/nodes/10.js')),
			__memo(() => import('../output/server/nodes/11.js')),
			__memo(() => import('../output/server/nodes/12.js')),
			__memo(() => import('../output/server/nodes/13.js')),
			__memo(() => import('../output/server/nodes/14.js')),
			__memo(() => import('../output/server/nodes/15.js')),
			__memo(() => import('../output/server/nodes/16.js')),
			__memo(() => import('../output/server/nodes/17.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/.well-known/appspecific/com.chrome.devtools.json",
				pattern: /^\/\.well-known\/appspecific\/com\.chrome\.devtools\.json\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/.well-known/appspecific/com.chrome.devtools.json/_server.js'))
			},
			{
				id: "/api/ai",
				pattern: /^\/api\/ai\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/ai/_server.js'))
			},
			{
				id: "/api/ai/suggest",
				pattern: /^\/api\/ai\/suggest\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/ai/suggest/_server.js'))
			},
			{
				id: "/api/auth",
				pattern: /^\/api\/auth\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/auth/_server.js'))
			},
			{
				id: "/api/auth/login",
				pattern: /^\/api\/auth\/login\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/auth/login/_server.js'))
			},
			{
				id: "/api/auth/logout",
				pattern: /^\/api\/auth\/logout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/auth/logout/_server.js'))
			},
			{
				id: "/api/auth/me",
				pattern: /^\/api\/auth\/me\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/auth/me/_server.js'))
			},
			{
				id: "/api/auth/register",
				pattern: /^\/api\/auth\/register\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/auth/register/_server.js'))
			},
			{
				id: "/api/groups",
				pattern: /^\/api\/groups\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/groups/_server.ts.js'))
			},
			{
				id: "/api/groups/invitations",
				pattern: /^\/api\/groups\/invitations\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/groups/invitations/_server.ts.js'))
			},
			{
				id: "/api/groups/invitation/[id]/respond",
				pattern: /^\/api\/groups\/invitation\/([^/]+?)\/respond\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/groups/invitation/_id_/respond/_server.ts.js'))
			},
			{
				id: "/api/groups/members",
				pattern: /^\/api\/groups\/members\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/groups/members/_server.ts.js'))
			},
			{
				id: "/api/groups/members/role",
				pattern: /^\/api\/groups\/members\/role\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/groups/members/role/_server.ts.js'))
			},
			{
				id: "/api/groups/shared/[id]",
				pattern: /^\/api\/groups\/shared\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/groups/shared/_id_/_server.js'))
			},
			{
				id: "/api/groups/[id]",
				pattern: /^\/api\/groups\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/groups/_id_/_server.ts.js'))
			},
			{
				id: "/api/groups/[id]/invite",
				pattern: /^\/api\/groups\/([^/]+?)\/invite\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/groups/_id_/invite/_server.ts.js'))
			},
			{
				id: "/api/groups/[id]/member/[memberId]",
				pattern: /^\/api\/groups\/([^/]+?)\/member\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false},{"name":"memberId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/groups/_id_/member/_memberId_/_server.ts.js'))
			},
			{
				id: "/api/groups/[id]/member/[memberId]/role",
				pattern: /^\/api\/groups\/([^/]+?)\/member\/([^/]+?)\/role\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false},{"name":"memberId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/groups/_id_/member/_memberId_/role/_server.ts.js'))
			},
			{
				id: "/api/notifications",
				pattern: /^\/api\/notifications\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/notifications/_server.js'))
			},
			{
				id: "/api/public-env-check",
				pattern: /^\/api\/public-env-check\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/public-env-check/_server.js'))
			},
			{
				id: "/api/public-test-mongo",
				pattern: /^\/api\/public-test-mongo\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/public-test-mongo/_server.js'))
			},
			{
				id: "/api/search/todos",
				pattern: /^\/api\/search\/todos\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/search/todos/_server.js'))
			},
			{
				id: "/api/search/todos/group",
				pattern: /^\/api\/search\/todos\/group\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/search/todos/group/_server.js'))
			},
			{
				id: "/api/search/todos/group/sync",
				pattern: /^\/api\/search\/todos\/group\/sync\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/search/todos/group/sync/_server.js'))
			},
			{
				id: "/api/search/todos/sync",
				pattern: /^\/api\/search\/todos\/sync\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/search/todos/sync/_server.js'))
			},
			{
				id: "/api/shared/group/[id]",
				pattern: /^\/api\/shared\/group\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/shared/group/_id_/_server.js'))
			},
			{
				id: "/api/socket.io",
				pattern: /^\/api\/socket\.io\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/socket.io/_server.js'))
			},
			{
				id: "/api/test-mongo",
				pattern: /^\/api\/test-mongo\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/test-mongo/_server.js'))
			},
			{
				id: "/api/test-socket",
				pattern: /^\/api\/test-socket\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/test-socket/_server.js'))
			},
			{
				id: "/api/todos",
				pattern: /^\/api\/todos\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/todos/_server.js'))
			},
			{
				id: "/api/todos/by-group/[groupId]",
				pattern: /^\/api\/todos\/by-group\/([^/]+?)\/?$/,
				params: [{"name":"groupId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/todos/by-group/_groupId_/_server.ts.js'))
			},
			{
				id: "/api/todos/by-id/[todoId]",
				pattern: /^\/api\/todos\/by-id\/([^/]+?)\/?$/,
				params: [{"name":"todoId","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/todos/by-id/_todoId_/_server.ts.js'))
			},
			{
				id: "/api/todos/[id]",
				pattern: /^\/api\/todos\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/todos/_id_/_server.js'))
			},
			{
				id: "/api/users/profile/image",
				pattern: /^\/api\/users\/profile\/image\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/api/users/profile/image/_server.js'))
			},
			{
				id: "/auth",
				pattern: /^\/auth\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: __memo(() => import('../output/server/entries/endpoints/auth/_server.js'))
			},
			{
				id: "/auth/login",
				pattern: /^\/auth\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/auth/signup",
				pattern: /^\/auth\/signup\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/dashboard",
				pattern: /^\/dashboard\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/groups",
				pattern: /^\/groups\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/groups/create",
				pattern: /^\/groups\/create\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/groups/[id]",
				pattern: /^\/groups\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/group/create",
				pattern: /^\/group\/create\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/group/[id]",
				pattern: /^\/group\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/notifications",
				pattern: /^\/notifications\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/profile",
				pattern: /^\/profile\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/shared/group/[id]",
				pattern: /^\/shared\/group\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/socket-debug",
				pattern: /^\/socket-debug\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/socket.io",
				pattern: /^\/socket\.io\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../output/server/entries/endpoints/socket.io/_server.js'))
			},
			{
				id: "/test-mongodb-connection",
				pattern: /^\/test-mongodb-connection\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/test-notifications",
				pattern: /^\/test-notifications\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 17 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
