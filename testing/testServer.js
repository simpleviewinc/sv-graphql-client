const { ApolloServer, gql, AuthenticationError } = require('apollo-server');

// Test data.
let test_books_data = [];

const typeDefs = gql`
	type Query {
		test_books(filter: test_books_filter, withRequiredValues: test_books_withRequiredValues): test_result
	}

	type test_result {
		success : Boolean!
		message : String
		books: [test_book]
		throw : Boolean
		throw2 : Boolean
	}

	type test_book {
		title: String
		author: String
	}
	
	input test_books_filter {
		throwError : Boolean
		authError : Boolean
		message : String
	}
	
	input test_books_withRequiredValues {
		requiredVal : String!
		nonRequiredVal : String
	}
`;

const resolvers = {
	Query: {
		test_books(parent, { filter : { throwError = false, authError = false, message } = {} }, context, info) {
			if (throwError) {
				throw new Error("Test throw!");
			}
			
			if (authError) {
				throw new AuthenticationError("Test throw!");
			}
			
			return {
				success : true,
				message : message || "messageValue",
				books : [
					{
						title: 'Harry Potter and the Chamber of Secrets',
						author: 'J.K. Rowling'
					},
					{
						title: 'Jurassic Park',
						author: 'Michael Crichton'
					}
				]
			}
		}
	},
	test_result : {
		throw : function() {
			throw new Error("Thrown from throw");
		},
		throw2 : function() {
			throw new Error("Thrown from throw2");
		}
	}
};

module.exports = new ApolloServer({ typeDefs, resolvers });