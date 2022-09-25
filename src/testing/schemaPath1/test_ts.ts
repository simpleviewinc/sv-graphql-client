const { gql } = require("apollo-server");

const typeDefs = gql`
	extend type Query {
		test_ts: Boolean
	}
`;

const resolvers = {
	Query: {
		test_ts: function() {
			return true;
		}
	}
}

module.exports = {
	typeDefs,
	resolvers
}