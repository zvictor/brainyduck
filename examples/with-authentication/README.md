<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/zvictor/brainyduck@master/.media/logo-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.jsdelivr.net/gh/zvictor/brainyduck@master/.media/logo-light.png">
    <img alt="Brainyduck's logo" src="https://cdn.jsdelivr.net/gh/zvictor/brainyduck@master/.media/logo.png">
  </picture>
<p>

# Authentication & authorization example

This example shows how to add authentication and authorization to a next.js project backed by brainyduck.

## Structure

The [domain](./domain) folder contains the models, roles and functions.

Everything else is just regular next.js code, but with special attention to [pages/api](./pages/api): that's where backend and frontend get connected.

## Setup

Execute `brainyduck` inside the domain folder and then start next.js as usual.

```bash
export FAUNA_SECRET=<your-secret>

$ npx brainyduck dev ./domain --no-watch
$ npx next dev
```
