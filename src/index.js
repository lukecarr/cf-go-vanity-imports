const MODULES = {
	litmus: "https://github.com/lukecarr/litmus",
};

const MODULES_LIST = Object.entries(MODULES)
	.sort(([a, _], [b, _]) => a - b)
	.map(([moduleName, repoUrl]) => `<li>${moduleName}: ${repoUrl}</li>`)
	.join("");

export default {
	async fetch({ url }) {
		const { hostname, pathname, searchParams } = new URL(url);

		if (pathname === "/") {
			return new Response(
				`<!DOCTYPE html><ul>${MODULES_LIST}</ul>`,
				{ headers: { "Content-Type": "text/html; charset=utf-8" } },
			);
		}

		const moduleName = pathname.split("/")[1];

		if (!moduleName || !Object.hasOwn(MODULES, moduleName)) {
			return new Response("Not Found", { status: 404 });
		}

		const repoUrl = MODULES[moduleName];

		// Go toolchain request — serve the go-import meta tag
		if (searchParams.get("go-get") === "1") {
			return new Response(
				`<!DOCTYPE html><meta name="go-import" content="${hostname}/${moduleName} git ${repoUrl}">`,
				{ headers: { "Content-Type": "text/html; charset=utf-8" } },
			);
		}

		return Response.redirect(repoUrl, 302);
	},
};
