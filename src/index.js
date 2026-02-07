const MODULES = ["litmus"];

export default {
  async fetch(request, { GITHUB_NAMESPACE }) {
    const { hostname, pathname, searchParams } = new URL(request.url);
    const moduleName = pathname.split("/")[1];

    if (!moduleName || !MODULES.includes(moduleName)) {
      return new Response("Not Found", { status: 404 });
    }

    const repoUrl = `https://github.com/${GITHUB_NAMESPACE}/${moduleName}`;

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
