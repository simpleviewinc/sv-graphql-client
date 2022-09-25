import { gql } from "apollo-server";

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
