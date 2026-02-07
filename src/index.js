// Configuration
const VANITY_DOMAIN = "go.carr.sh";
const GITHUB_NAMESPACE = "lukecarr";
const MODULES = ["litmus"];

const moduleData = MODULES.reduce(
  (acc, module) => ({
    ...acc,
    [module]: {
      vanityImportPath: `${VANITY_DOMAIN}/${module}`,
      githubRepoUrl: `https://github.com /${GITHUB_NAMESPACE}/${module}`,
    },
  }),
  {},
);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Extract module name from path (first segment)
    const pathSegments = path.split("/").filter(Boolean);
    if (pathSegments.length === 0) {
      return new Response("Not Found", { status: 404 });
    }

    const moduleName = pathSegments[0];

    // Check if module exists
    const module = moduleData[moduleName];
    if (!module) {
      return new Response("Not Found", { status: 404 });
    }

    const { vanityImportPath, githubRepoUrl } = module;

    // Handle go-get requests
    if (url.searchParams.get("go-get") === "1") {
      const html = `<!DOCTYPE html>
<html>
<head>
<meta name="go-import" content="${vanityImportPath} git ${githubRepoUrl}">
</head>
<body>
go get ${vanityImportPath}
</body>
</html>`;

      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Browser request - redirect to GitHub
    return Response.redirect(githubRepoUrl, 302);
  },
};
