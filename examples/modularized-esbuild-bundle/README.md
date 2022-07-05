<p align="center"><img src="https://raw.githubusercontent.com/zvictor/faugra/master/.media/logo.png" alt="faugra's logo" /><p>

# Modularized Esbuild Bundle example

This example contains:

- an [ECMAScript module](https://nodejs.org/api/esm.html)
- multiple graphql schemas and User-Defined Function (UDF) spread in 2 **different folders**
- a root graphql schema containing the Query type
- **a bundle made by esbuild while making use of the [faugra plugin](https://github.com/zvictor/faugra/tree/master/bundlers/esbuild)**

By running `npx faugra --secret <MY_FAUNA_SECRET>` you should expect to see:

- all UDF uploaded to the cloud
- a requests sdk containing all the operations, fully typed and with auto-complete support [accessible through `import sdk from 'faugra'`]

Once faugra has been setup, you can run `FAUNA_SECRET=<MY_FAUNA_SECRET> npm start` to execute the operations demonstration [index.ts].

[![asciicast](https://raw.githubusercontent.com/zvictor/faugra/master/.media/examples/modularized.gif)](https://asciinema.org/a/361562)
