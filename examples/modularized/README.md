This example contains:

- multiple graphql schemas and User-Defined Function (UDF) spread in 2 different folders
- a root graphql schema containing the Query type

By running `npx faugra --secret <MY_FAUNA_SECRET>` you should expect to see:

- all UDF uploaded to the cloud
- a TypeScript typings file generated next to their respective schema [Query.d.ts, accounts/User.d.ts, blog/Post.d.ts]
