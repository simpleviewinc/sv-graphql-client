const { ApolloServer, gql } = require('apollo-server');

// Test data.
let test_books_data = [];

const typeDefs = gql`
    type Query {
        test_books: test_result
    }

    type Mutation {
        test_books_update(input : test_update_book!) : test_result
        test_reset : test_result
    }

    type test_result {
		success : Boolean!
		message : String
		books: [test_book]
	}

    type test_book {
        title: String
        author: String
    }

    input test_update_book {
        index: String!
        title: String!
        author: String
    }
`;

const resolvers = {
    Query: {
        test_books(parent, arg, context, info) { 
            return {
                success : true
            }
        }
    },
    Mutation:{
        test_books_update(parent, { input : { title, index, author } }, context, info) {
            const itemIndex = parseInt(index);
            test_books_data[itemIndex].title = title;
            if(author !== undefined) {
                test_books_data[itemIndex].author = author;
            };

            return {
                success : true
            };
        },
        test_reset(parent, arg, context, info) {
            test_books_data = [
                {
                    title: 'Harry Potter and the Chamber of Secrets',
                    author: 'J.K. Rowling'
                },
                {
                    title: 'Jurassic Park',
                    author: 'Michael Crichton'
                }
            ];

            return {
                success : true
            };
        }
    },
    test_result : {
		books(parent, args, context, info) {
			return test_books_data;
		}
	},
};

module.exports = new ApolloServer({ typeDefs, resolvers });