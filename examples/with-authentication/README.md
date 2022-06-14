<p align="center"><img src="https://raw.githubusercontent.com/zvictor/faugra/master/.media/logo.png" alt="faugra's logo" /><p>

# Authentication & authorization example

This example shows how to add authentication and authorization to a next.js project backed by faugra.

## Structure

The [domain](./domain) folder contains the models, roles and functions.

Everything else is just regular next.js code, but with special attention to [pages/api](./pages/api): that's where backend and frontend get connected.

## Setup

Execute `faugra` inside the domain folder and then start next.js as usual.

```bash
export FAUGRA_SECRET=<your-secret>
export FAUGRA_EXCLUSIVE_SECRET=<your-secret>

$ npx faugra dev ./domain --no-watch
$ npx next dev
```
