const { makeExecutableSchema } = require("@graphql-tools/schema");
const { readdirRegex } = require("./utils");
const lodash = require("lodash");

/**
 * @typedef {object} GraphModule
 * @property {object} typeDefs
 * @property {object} resolvers
 * @property {function[]} schemaTransformers
 */

/**
 * @callback LoaderFunction
 * @returns {Promise<GraphModule>}
 */

/**
 * Generates a schema to be passed to an ApolloServer instance. It can be loaded either with static files from paths or using loader functions.
 *
 * Each file or loader should return a {@link GraphModule}.
 * @param {object} args
 * @param {string[]} [args.paths] - The paths where schema files are located
 * @param {LoaderFunction[]} [args.loaders] - Loaders used to dynamically generate graphql definitions
 */
const schemaLoader = async function({
	paths = [],
	loaders = []
}) {
	const typeDefs = [];
	const resolvers = [];
	const schemaTransformers = [];
	const defs = [];

	for (const path of paths) {
		const dirResult = await readdirRegex(path, /\.[tj]s$/);

		for (const name of dirResult) {
			const temp = require(`${path}/${name}`);
			defs.push(temp);
		}
	}

	for (const loader of loaders) {
		const temp = await loader();
		defs.push(temp);
	}

	for (const def of defs) {
		if (def.typeDefs !== undefined) {
			typeDefs.push(def.typeDefs);
		}

		if (def.resolvers !== undefined) {
			resolvers.push(def.resolvers);
		}

		if (def.schemaTransformers !== undefined) {
			schemaTransformers.push(...def.schemaTransformers);
		}
	}

	let schema = makeExecutableSchema({
		typeDefs,
		resolvers: lodash.merge({}, ...resolvers)
	});

	schemaTransformers.forEach((schemaTransformer) => {
		schema = schemaTransformer(schema);
	});

	return schema;
}

module.exports = schemaLoader;
