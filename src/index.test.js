import { describe, test, expect } from "bun:test";
import worker from "./index.js";

const TEST_DOMAIN = "go.carr.sh";

/**
 * Helper to invoke the worker's fetch handler.
 * @param {string} path - URL path (e.g. "/litmus" or "/litmus?go-get=1")
 * @returns {Promise<Response>}
 */
function request(path) {
  return worker.fetch(new Request(`https://${TEST_DOMAIN}${path}`), {
    GITHUB_NAMESPACE: "lukecarr",
  });
}

// ---------------------------------------------------------------------------
// Root path
// ---------------------------------------------------------------------------
describe("root path", () => {
  test("returns 404", async () => {
    const res = await request("/");
    expect(res.status).toBe(404);
  });

  test("body says Not Found", async () => {
    const res = await request("/");
    expect(await res.text()).toBe("Not Found");
  });
});

// ---------------------------------------------------------------------------
// Unknown module
// ---------------------------------------------------------------------------
describe("unknown module", () => {
  test("returns 404 for unregistered module", async () => {
    const res = await request("/unknown-module");
    expect(res.status).toBe(404);
  });

  test("body says Not Found", async () => {
    const res = await request("/unknown-module");
    expect(await res.text()).toBe("Not Found");
  });
});

// ---------------------------------------------------------------------------
// go-get requests (Go toolchain)
// ---------------------------------------------------------------------------
describe("go-get request", () => {
  test("returns 200", async () => {
    const res = await request("/litmus?go-get=1");
    expect(res.status).toBe(200);
  });

  test("Content-Type is text/html", async () => {
    const res = await request("/litmus?go-get=1");
    expect(res.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
  });

  test("contains go-import meta tag with correct content", async () => {
    const res = await request("/litmus?go-get=1");
    const html = await res.text();
    expect(html).toContain(
      `<meta name="go-import" content="${TEST_DOMAIN}/litmus git https://github.com/lukecarr/litmus">`,
    );
  });

  test("go-get with subpath still resolves the module", async () => {
    const res = await request("/litmus/subpackage?go-get=1");
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain(
      `<meta name="go-import" content="${TEST_DOMAIN}/litmus git https://github.com/lukecarr/litmus">`,
    );
  });
});

// ---------------------------------------------------------------------------
// Browser requests (no go-get param → redirect)
// ---------------------------------------------------------------------------
describe("browser redirect", () => {
  test("returns 302", async () => {
    const res = await request("/litmus");
    expect(res.status).toBe(302);
  });

  test("redirects to GitHub repo URL", async () => {
    const res = await request("/litmus");
    expect(res.headers.get("Location")).toBe(
      "https://github.com/lukecarr/litmus",
    );
  });

  test("redirect works with trailing slash", async () => {
    const res = await request("/litmus/");
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe(
      "https://github.com/lukecarr/litmus",
    );
  });
});

// ---------------------------------------------------------------------------
// Domain derived from request URL
// ---------------------------------------------------------------------------
describe("domain from request URL", () => {
  test("uses the request hostname in go-import meta tag", async () => {
    const res = await worker.fetch(
      new Request("https://custom.example.com/litmus?go-get=1"),
      { GITHUB_NAMESPACE: "lukecarr" },
    );
    const html = await res.text();
    expect(html).toContain(
      `<meta name="go-import" content="custom.example.com/litmus git https://github.com/lukecarr/litmus">`,
    );
  });
});
