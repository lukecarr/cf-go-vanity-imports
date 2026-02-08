# cf-go-vanity-imports

> **Proof of concept** for a tiny Cloudflare Worker that serves [Go vanity import paths](https://pkg.go.dev/cmd/go#hdr-Remote_import_paths) with just ~20 lines of JavaScript.
>
> Currently powering [`go.carr.sh`](https://go.carr.sh).

Go vanity imports let you use a custom domain (e.g. `go.carr.sh/litmus`) as the canonical import path for your Go modules, while the source code lives on GitHub. This worker handles the handshake between the Go toolchain and your repos.

## How it works

When the Go toolchain fetches a module it sends a `?go-get=1` query parameter. The worker responds with an HTML page containing a `<meta name="go-import">` tag that points to the corresponding GitHub repository:

```
GET https://go.carr.sh/litmus?go-get=1

→ <meta name="go-import" content="go.carr.sh/litmus git https://github.com/lukecarr/litmus">
```

If a regular browser hits the same URL (without `?go-get=1`), the worker redirects to the GitHub repo instead.

## Adding a module

Modules are registered in the `MODULES` array in `src/index.js`. Each entry maps to a GitHub repo under the configured `GITHUB_NAMESPACE` (set as an environment variable in `wrangler.jsonc`).

## Getting started

### Prerequisites

The only prerequisite is [Bun](https://bun.sh/). The specific version of Bun is pinned in [.bun-version](/.bun-version).

### Install dependencies

Install the worker's dependencies with Bun:

```sh
bun install
```

### Run locally

Run the worker in development mode with hot reloading:

```sh
bun run dev
```

### Run tests

Run tests with coverage reporting (we strive for 100% coverage):

```sh
bun test --coverage
```

## Deployment

The worker is deployed to Cloudflare via [Wrangler](https://developers.cloudflare.com/workers/wrangler/):

```sh
bun run deploy
```

Routing is configured in `wrangler.jsonc` to serve requests on the `go.carr.sh` custom domain.

## License

This repo is licensed under the [MIT License](LICENSE).
