const { GraphQLScalarType, Kind } = require("graphql");
const { gql } = require("apollo-server");

const testScalar = new GraphQLScalarType({
	name: "test_scalar",
	serialize(value) {
		return value + " serialized"
	},
	parseValue(value) {
		return value + " parseValue"
	},
	parseLiteral(ast) {
		if (ast.kind === Kind.STRING) {
			return ast.value + " parseLiteral"
		}
	}
});

const typeDefs = gql`
	scalar test_scalar

	extend type Query {
		test_scalar(id: test_scalar): test_scalar_result
	}

	type test_scalar_result {
		id: String
		test_scalar: test_scalar
	}
`;

const resolvers = {
	test_scalar: testScalar,
	Query: {
		test_scalar: function(parent, { id }) {
			return {
				id,
				test_scalar: "output"
			}
		}
	}
}

module.exports = {
	typeDefs,
	resolvers
}