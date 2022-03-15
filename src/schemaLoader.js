const { makeExecutableSchema } = require("@graphql-tools/schema");
const { readdirRegex } = require("./utils");
const lodash = require("lodash");

module.exports = async function({ graphqlRootDirectory }) {
	const typeDefs = [];
	const resolvers = [{}];
	const schemaTransformers = [];

	const dirResult = await readdirRegex(graphqlRootDirectory, /\.js$/);

	for(let name of dirResult) {
		const temp = require(`${graphqlRootDirectory}/${name}`);

		if (temp.typeDefs !== undefined) {
			typeDefs.push(temp.typeDefs);
		}

		if (temp.resolvers !== undefined) {
			resolvers.push(temp.resolvers);
		}

		if (temp.schemaTransformers !== undefined) {
			schemaTransformers.push(...temp.schemaTransformers);
		}
	}

	let schema = makeExecutableSchema({
		typeDefs,
		resolvers : lodash.merge(...resolvers)
	});

	schemaTransformers.forEach((schemaTransformer) => {
		schema = schemaTransformer(schema);
	});

	return schema;
}