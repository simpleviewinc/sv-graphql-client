const { gql } = require("apollo-server-express");
const { ObjectId } = require("mongodb");
const assert = require("assert");
const { mapSchema, getDirective, MapperKind } = require("@graphql-tools/utils");
const { defaultFieldResolver } = require("graphql");

const {
	mongoHelpers: {
		testId
	},
	scalarObjectId
} = require("@simpleview/sv-mongo-graphql-utils");

const typeDefs = gql`
	scalar test_objectid

	directive @test_directive(
		message: String = "testing"
	) on FIELD_DEFINITION

	directive @test_directive_upper on FIELD_DEFINITION

	extend type Query {
		test : test_query
	}

	type test_query {
		simple: String
		objectid(id: test_objectid): test_objectid
		upper: String @test_directive_upper
	}

	extend type Mutation {
		test : test_mutation
	}

	type test_mutation {
		simple: String
	}

	type test_result {
		message : String @test_directive(message: "testing")
	}
`;

const resolvers = {
	Query: {
		async test(parent, { acct_id }, context, info) {
			return {};
		}
	},
	Mutation: {
		async test(parent, { acct_id }, context, info) {
			return {};
		}
	},
	test_query: {
		simple: function() {
			return "query_simple";
		},
		objectid: function(parent, { id }) {
			if (id) {
				assert.strictEqual(id instanceof ObjectId, true);
				return id;
			} else {
				return testId("0")
			}
		},
		upper: function() {
			return "upper";
		}
	},
	test_mutation: {
		simple: function() {
			return "mutation_simple"
		}
	},
	test_objectid: scalarObjectId("test_objectid")
};

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

module.exports = {
	typeDefs,
	resolvers,
	schemaTransformers
}