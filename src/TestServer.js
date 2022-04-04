const { ApolloServer } = require("apollo-server");

const schemaLoader = require("./utils/schemaLoader");

/**
 * Used for easily booting up a graph server based on a folder of graphql files.
 */
class TestServer {
	/**
	 * @param {Object} args
	 * @param {number} [args.port] - The number to access your test server on http://localhost:port/
	 * @param {string[]} [args.paths] - The paths where your schema files are located
	 * @param {function[]} [args.loaders] - Loader functions
	 */
	constructor({ port = 80, paths, loaders }) {
		this.port = port;
		this.paths = paths;
		this.loaders = loaders;
		this.server = undefined;
	}
	/**
	 * Start the express server, close it via close()
	 */
	async boot() {
		this.server = new ApolloServer({
			schema: await schemaLoader({ paths: this.paths, loaders: this.loaders })
		});

		await this.server.listen({
			port: this.port
		});
	}
	/**
	 * Close the ApolloServer
	 */
	async close() {
		return this.server.stop();
	}
}

module.exports = TestServer;
