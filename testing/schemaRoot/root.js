const { gql } = require("apollo-server");

const typeDefs = gql`
	type Query
`

const resolvers = {};

module.exports = {
	typeDefs,
	resolvers
}