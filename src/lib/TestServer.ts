import { ApolloServer } from "apollo-server";

import schemaLoader, { LoaderFunction } from "./schemaLoader";

type ApolloContext = ConstructorParameters<typeof ApolloServer>[0]["context"]

/**
 * Used for easily booting up a graph server based on a folder of graphql files.
 */
class TestServer {
	port: number
	paths?: string[]
	loaders?: LoaderFunction[]
	server?: ApolloServer
	context?: ApolloContext
	constructor({
		port = 80,
		paths,
		loaders,
		context
	}: {
		/** The number to access your test server on http://localhost:port/ */
		port?: number
		/** The paths where your schema files are located */
		paths?: string[]
		/** schemaLoader loader functions */
		loaders?: LoaderFunction[]
		context?: ApolloContext
	}) {
		this.port = port;
		this.paths = paths;
		this.loaders = loaders;
		this.context = context;
	}
	/**
	 * Start the express server, close it via close()
	 */
	async boot() {
		this.server = new ApolloServer({
			schema: await schemaLoader({ paths: this.paths, loaders: this.loaders }),
			context: this.context
		});

		await this.server.listen({
			port: this.port
		});
	}
	/**
	 * Close the ApolloServer
	 */
	async close() {
		return this.server?.stop();
	}
}

export default TestServer;
