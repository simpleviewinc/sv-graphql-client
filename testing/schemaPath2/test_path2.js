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