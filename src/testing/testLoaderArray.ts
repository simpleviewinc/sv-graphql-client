import gql from "graphql-tag";

export default async function testLoader() {
	return [
		{
			typeDefs: gql`
				extend type Query {
					test_loader_array_1: Boolean
				}
			`,
			resolvers: {
				Query: {
					test_loader_array_1: function() {
						return true;
					}
				}
			}
		},
		{
			typeDefs: gql`
				extend type Query {
					test_loader_array_2: Boolean
				}
			`,
			resolvers: {
				Query: {
					test_loader_array_2: function() {
						return true;
					}
				}
			}
		},
	]
}
