import gql from "graphql-tag";

export default async function testLoader() {
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
