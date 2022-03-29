# sv-graphql-client
Client and tools for communicating with sv-graphql.

# installation

```
npm install @simpleview/sv-graphql-client
```

# Package API

## GraphServer

`GraphServer` is an for communicating with the `sv-graphql` system. It helps eliminate some of the bloat of individual graphQL calls and makes it a little easier to work with.


* args
	* graphUrl - string - Fully qualified URL pointing to the graphURL server.
	* context - object - Context object used for handling token/acct_id
		* acct_id - string - The acct_id that the user is attempting to access. `acct_id` is required for any endpoints on `admin`.
		* token - string - The token returned from the auth system. Token is required for accessing any of the non-login mechanics.
	* prefixes - array of `class` - Prefixes which encasulate the behavior of the graphQL apis.

In most cases you will be setting the `context` at runtime. If so, manually update the context via setting `graphServer.context.acct_id = "x"`.

Available prefixes, see the following packages to install the prefixes.

* [auth](https://github.com/simpleviewinc/sv-auth-client)
* [admin](https://github.com/simpleviewinc/sv-auth-client)
* [email](https://github.com/simpleviewinc/sv-email-client)

```
const { GraphServer } = require("@simpleview/sv-graphql-client");
const graphServer = new GraphServer({
	graphUrl : GRAPH_URL,
	prefixes : [PrefixOne, PrefixTwo]
});
```

The endpoints on the graphServer prefix should, in general, match 1-to-1 with the arguments and syntax of the GraphQL schema browser.

## nullToUndefined

This function will take a graphQL response and convert `null` values to `undefined`. It can be helpful for trimming away fields that weren't returned from graph.

This does an by reference modification of the object. It does not return a clone.

* obj - object - The object that you wish to clean.

```js
const { nullToUndefined } = require("@simpleview/sv-graphql-client");
const result = await someGraphCall();
nullToUndefined(result);
```


## query

Wrapper function to make it easier to talk to `sv-graphql` directly.

* args
	* query - string - The graphQL query string. Usually best passed with JS template tag syntax.
	* variables - obj - If you're query utilizes variables, pass them on this object.
	* url - string - The URL of the graphQL endpoint.
	* token - string - The token which will be passed on the `Authorization` header as a `Bearer` token.
	* headers - obj - An object of headers to append to the request
	* key - string - Whether to reach and return a specific sub-key of the return.
	* clean - boolean - Whether to automatically run nullToUndefined on the result set to clean it.

```js
const { query } = require("@simpleview/sv-graphql-client");
const result = await query({
	query : `
		query($token: String) {
			auth {
				current
			}
		}
	`,
	variables : {
		token : "my fake token"
	},
	url : "https://graphql.simpleviewinc.com/"
});
```

## isPlainObject

Simple function for testing if a function is a plain JS object.

## schemaLoader

schemaLoader takes all of the files present in `paths` or `loaders` and merges them into a single schema. This allows you to make your larger schema more maintainable by splitting it up into logical units. An example of a modular schema is outlined in [Modularizing Your GraphQL Schema](https://www.apollographql.com/blog/modularizing-your-graphql-schema-code-d7f71d5ed5f2/).

* args
  * paths - string[] - Folders containing graphql schema files which export a `GraphModule`.
  * loaders - function[] - Loaders that will return a `GraphModule`. Use this when you need to load graph definitions that are dynamically generated.

A `GraphModule` is an object of `{ typeDefs, resolvers, schemaTransformers }`, all keys are optional.

Example `GraphModule`:
```js
const { gql } = require("apollo-server");

const typeDefs = gql`
	extend type Query {
		test_path2: Boolean
	}
`;

const resolvers = {
	Query: {
		test_path2: function() {
			return true;
		}
	}
}

module.exports = {
	typeDefs,
	resolvers
}
```

```js
const { schemaLoader } = require("@simpleview/sv-mongo-graphql-utils");

const schema = await schemaLoader({
	paths : ['/app/lib/graphql']
});

const server = new ApolloServer({
  schema,
  ...
});
```
