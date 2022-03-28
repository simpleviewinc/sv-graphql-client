const { mapSchema, getDirective, MapperKind } = require("@graphql-tools/utils");
const { gql } = require("apollo-server");

const typeDefs = gql`
	directive @test_directive_upper on FIELD_DEFINITION

	extend type Query {
		test_directive_upper(id: String): String @test_directive_upper
	}
`;

function upperDirectiveTransformer(schema) {
	return mapSchema(schema, {
		[MapperKind.OBJECT_FIELD]: (fieldConfig) => {
			const upperDirective = getDirective(schema, fieldConfig, "test_directive_upper")?.[0];

			if (upperDirective) {
				const { resolve = defaultFieldResolver } = fieldConfig;

				fieldConfig.resolve = async function (source, args, context, info) {
					const result = await resolve(source, args, context, info);

					if (typeof result === "string") {
						return result.toUpperCase();
					}

					return result;
				}

				return fieldConfig;
			}
		}
	});
}

const schemaTransformers = [
	upperDirectiveTransformer
]

const resolvers = {
	Query: {
		test_directive_upper: function(parent, { id }) {
			return id;
		}
	}
}

module.exports = {
	typeDefs,
	schemaTransformers,
	resolvers
}