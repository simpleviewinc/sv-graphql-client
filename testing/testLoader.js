const { gql } = require("apollo-server");

module.exports = async function() {
	return {
		typeDefs: gql`
			extend type Query {
				test_loader: Boolean
			}
		`,
		resolvers: {
			Query: {
				test_loader: function() {
					return true;
				}
			}
		}
	}
}