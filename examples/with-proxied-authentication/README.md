<p align="center"><img src="https://raw.githubusercontent.com/zvictor/brainyduck/master/.media/logo.png" alt="brainyduck's logo" /><p>

# Proxied Authentication & authorization example

This example shows how to add authentication and authorization to a next.js project backed by brainyduck, tunneling all database calls through a proxy on the backend.

## Structure

- The [domain](./domain) folder contains the models, roles and functions.

- The files [pages/api/proxy.ts](./pages/api/proxy.ts) and [lib/proxy.ts](./lib/proxy.ts) handle all the proxy related work.

- Everything else is just regular next.js code, but with special attention to [pages/api](./pages/api): that's where backend and frontend get connected.

## Setup

Execute `brainyduck` inside the domain folder and then start next.js as usual.

```bash
export FAUNA_SECRET=<your-secret>

$ npx brainyduck dev ./domain --no-watch
$ npx next dev
```
