const { gql } = require("apollo-server");

const typeDefs = gql`
	extend type Query {
		test_ts: Boolean
	}
`;

const resolvers = {
	Query: {
		test_ts: function() {
			const wut = 2
			 *
			2;

					const badLint = "something";

			return wut;
		}
	}
}

module.exports = {
	typeDefs,
	resolvers
}
