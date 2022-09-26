const { gql, AuthenticationError } = require('apollo-server');

const typeDefs = gql`
	extend type Query {
		test_books(filter: test_books_filter, withRequiredValues: test_books_withRequiredValues): test_result
		test_returns(input: test_returns_input): test_return
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

	type test_return {
		input: test_return_input
		headers: test_return_headers
	}

	type test_return_input {
		data: String
		nested: test_return_input
	}

	type test_return_headers {
		authorization: String
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

	input test_returns_input {
		data: String
		nested: test_returns_input
	}
`;

const resolvers = {
	Query: {
		test_books(parent, { filter: { throwError = false, authError = false, message } = {} }, context, info) {
			if (throwError) {
				throw new Error("Test throw!");
			}

			if (authError) {
				throw new AuthenticationError("Test throw!");
			}

			return {
				success: true,
				message: message || "messageValue",
				books: [
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
		},
		test_returns(parent, { input }, context, info) {
			return {
				input,
				headers: context.headers
			}
		}
	},
	test_result: {
		throw: function() {
			throw new Error("Thrown from throw");
		},
		throw2: function() {
			throw new Error("Thrown from throw2");
		}
	}
}

module.exports = {
	typeDefs,
	resolvers
};
