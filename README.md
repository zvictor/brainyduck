<p align="center"><img src="./.design/logo.jpg" alt="faugra's logo" /><p>
<br>

<p align="center">
<strong>A micro backend framework/builder</strong><br />
<sub>faugra is an opinionated approach to quickly building powerful backends while leveraging on the power of FAUnadb + GRAphql.</sub>
</p>

<p align="center">
  [ <a href="#getting-started">Getting started 🤓</a> | <a href="#getting-started">Installation 💾</a> | <a href="#usage">Usage 🦆</a> | <a href="https://www.npmjs.com/package/faugra">NPM 📦</a> | <a href="https://www.npmjs.com/package/faugra">Github 🕸</a> ]
</p>
<br />

## Getting started

It takes just 2 steps to get started:

1. Create a `.gql` file
2. In the same folder, run `npx faugra --secret <MY_FAUNA_SECRET>`

![divider](.design/divider.png)

## Installation

You can install it globally, per project or just run it on demand:

```bash
  # npm, globally:
  $ npm install -g faugra

  # npm, project-only:
  $ npm i faugra -D

  # or run on demand:
  $ npx faugra
```

![divider](.design/divider.png)

## Usage

```
Usage: faugra [options] [command]

Options:
  -V, --version                      output the version number
  -s, --secret <value>               set Fauna's secret key, used to push/pull schemas to and from the database (defaults to <FAUGRA_SECRET>).
  -d, --domain <value>               set Fauna's endpoint (defaults to <FAUGRA_DOMAIN or 'https://graphql.fauna.com'>).
  -h, --help                         display help for command

Commands:
  dev [directory]                    watch for changes and run helpers accordingly. Defaults: [directory: <pwd>]
  define-functions [pattern]         upload your User-Defined Functions (UDF) to faunadb. Defaults: [pattern: **/*.fql]
  pull-schema [output]               load the schema hosted in faunadb. Defaults: [output: <stdout>]
  push-schema [pattern]              push your schema to faunadb. Defaults: [pattern: **/*.gql,**/*.graphql,!node_modules]
  generate-types [pattern] [output]  code generator that converts graphql schemas into typescript types. Defaults: [pattern: **/*.gql,**/*.graphql,!node_modules, output: <stdout>]
  help [command]                     display help for command
```

![divider](.design/divider.png)

<p align="center">
Logo by <a href="https://pixabay.com/users/OpenClipart-Vectors-30363/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1299735">OpenClipart-Vectors</a> from <a href="https://pixabay.com/?utm_source=link-attribution&amp;utm_medium=referral&amp;utm_campaign=image&amp;utm_content=1299735">Pixabay</a>
</p>
