import { default as GraphServer, GraphServerPrefixArgs } from "../lib/GraphServer";
import { query, TestServer } from "../";
import assert from "assert";
import { testArray } from "@simpleview/mochalib";
import { deepCheck } from "@simpleview/assertlib";

import testLoader from "./testLoader";

describe(__filename, function() {
	it("should boot a graphServer with context", async function() {
		class TestPrefix {
			name: string
			graphUrl: string
			graphServer: GraphServer
			constructor(args: GraphServerPrefixArgs) {
				this.name = "test";
				this.graphUrl = args.graphUrl;
				this.graphServer = args.graphServer;
			}
			doSomething() {
				return `true_${this.graphServer.context.hax}`;
			}
		}

		const graphServer = new GraphServer({
			graphUrl: "http://fake.com/",
			prefixes: [TestPrefix]
		}) as GraphServer & {
			test: TestPrefix
		};

		assert.strictEqual(graphServer.test.graphServer, graphServer);

		let result = await graphServer.test.doSomething();
		assert.strictEqual(result, "true_undefined");
		graphServer.context.hax = "testing";
		result = await graphServer.test.doSomething();
		assert.strictEqual(result, "true_testing");
	});

	it("should boot a graphServer with different urls for different prefixes", async function() {
		class PrefixOne {
			name: string
			graphUrl: string
			constructor(args: GraphServerPrefixArgs) {
				this.name = "one";
				this.graphUrl = args.graphUrl;
			}
		}

		class PrefixTwo {
			name: string
			graphUrl: string
			constructor(args: GraphServerPrefixArgs) {
				this.name = "two";
				this.graphUrl = args.graphUrl;
			}
		}

		class PrefixThree {
			name: string
			graphUrl: string
			constructor(args: GraphServerPrefixArgs) {
				this.name = args.name ?? "three";
				this.graphUrl = args.graphUrl;
			}
		}

		const g = new GraphServer({
			graphUrl: "https://www.google.com/",
			prefixes: [
				{
					prefix: PrefixOne,
					graphUrl: "https://www.bing.com/"
				},
				PrefixTwo,
				{
					prefix: PrefixThree,
					graphUrl: "https://www.yelp.com/"
				},
				{
					name: "three_changed",
					prefix: PrefixThree,
					graphUrl: "https://www.yahoo.com/"
				}
			]
		});

		assert.strictEqual(g.one.graphUrl, "https://www.bing.com/");
		assert.strictEqual(g.two.graphUrl, "https://www.google.com/");
		assert.strictEqual(g.three.graphUrl, "https://www.yelp.com/");
		assert.strictEqual(g.three_changed.graphUrl, "https://www.yahoo.com/");
	});

	describe("query", function() {
		const graphUrl = "http://localhost:80/";
		let server;
		before(async () => {
			// start Server
			server = new TestServer({
				paths: [
					`${__dirname}/schemaRoot`,
					`${__dirname}/schemaPath1`,
					`${__dirname}/schemaPath2`,
					`${__dirname}/schemaScalars`,
					`${__dirname}/schemaDirectives`
				],
				loaders: [
					testLoader
				],
				// context: ({ req }) => {
				// 	return {
				// 		headers: req.headers
				// 	}
				// }
			});

			await server.boot();
		});

		after(async () => {
			await server.close();
		});

		const tests = [
			{
				name: "simple query",
				args: () => ({
					url: graphUrl,
					query: `
						query {
							test_books {
								success
								message
								books {
									title
									author
								}
							}
						}
					`,
					result: {
						test_books: {
							success: true,
							message: "messageValue",
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
					}
				})
			},
			{
				name: "incorrect fields passed",
				args: () => ({
					url: graphUrl,
					query: `
						query {
							test_books {
								bogusKey
							}
						}
					`,
					error: 'Cannot query field "bogusKey" on type "test_result".'
				})
			},
			{
				name: "incorrect graph url",
				args: () => ({
					url: "http://localhost:1234/",
					query: `
						query {
							test_books {
								success
							}
						}
					`,
					error: 'connect ECONNREFUSED 127.0.0.1:1234'
				})
			},
			{
				name: "thrown error",
				args: () => ({
					url: graphUrl,
					query: `
						query {
							test_books(filter : { throwError : true }) {
								success
							}
						}
					`,
					error: 'Test throw!'
				})
			},
			{
				name: "auth error",
				args: () => ({
					url: graphUrl,
					query: `
						query {
							test_books(filter : { authError : true }) {
								success
							}
						}
					`,
					error: 'Test throw!'
				})
			},
			{
				name: "thrown error in nested resolver",
				args: () => ({
					url: graphUrl,
					query: `
						query {
							test_books {
								throw
							}
						}
					`,
					error: "Thrown from throw"
				})
			},
			{
				name: "thrown error in 2 nested resolvers",
				args: () => ({
					url: graphUrl,
					query: `
						query {
							test_books {
								throw
								throw2
							}
						}
					`,
					error: "Thrown from throw, Thrown from throw2"
				})
			},
			{
				name: "with variables",
				args: () => ({
					url: graphUrl,
					query: `
						query($filter: test_books_filter) {
							test_books(filter: $filter) {
								success,
								message
							}
						}
					`,
					variables: {
						filter: {
							message: "Changed"
						}
					},
					result: {
						test_books: {
							success: true,
							message: "Changed"
						}
					}
				})
			},
			{
				name: "missing required variables",
				args: () => ({
					url: graphUrl,
					query: `
						query($filter: test_books_withRequiredValues) {
							test_books(withRequiredValues: $filter) {
								success
							}
						}
					`,
					variables: {
						filter: {}
					},
					error: 'Variable "$filter" got invalid value {}; Field "requiredVal" of required type "String!" was not provided.'
				})
			},
			{
				name: "multiple errors",
				args: () => ({
					url: graphUrl,
					query: `
						query {
							test_books {
								success
								bogus
								books {
									bogus
								}
							}
						}
					`,
					error: 'Cannot query field "bogus" on type "test_result". Did you mean "books"?, Cannot query field "bogus" on type "test_book".'
				})
			},
			{
				name: "max_body_length and max_content_length",
				timeout: 5000,
				args: () => ({
					url: graphUrl,
					query: `
						query($filter: test_books_filter) {
							test_books(filter: $filter) {
								success,
								message
							}
						}
					`,
					variables: {
						filter: {
							message: 'x'.repeat(15 * 1024 * 1024)
						}
					},
					result: {
						test_books: {
							success: true,
							message: 'x'.repeat(15 * 1024 * 1024)
						}
					}
				})
			},
			{
				name: "clean out null values",
				args: () => ({
					url: graphUrl,
					clean: true,
					query: `
						query($input: test_returns_input) {
							test_returns(input: $input) {
								input {
									data
									nested {
										data
										nested {
											data
										}
									}
								}
							}
						}
					`,
					variables: {
						input: {
							data: "foo",
							nested: {
								data: null,
								nested: {
									data: null
								}
							}
						}
					},
					result: {
						test_returns: {
							input: {
								data: "foo",
								nested: {
									data: undefined,
									nested: {
										data: undefined
									}
								}
							}
						}
					}
				})
			},
			{
				name: "return null keys if returned",
				args: () => ({
					url: graphUrl,
					query: `
						query($input: test_returns_input) {
							test_returns(input: $input) {
								input {
									data
									nested {
										data
										nested {
											data
										}
									}
								}
							}
						}
					`,
					variables: {
						input: {
							data: null,
							nested: null
						}
					},
					result: {
						test_returns: {
							input: {
								data: null,
								nested: null
							}
						}
					}
				})
			},
			{
				name: "reach into key",
				args: () => ({
					url: graphUrl,
					key: "test_returns.input.nested.data",
					query: `
						query($input: test_returns_input) {
							test_returns(input: $input) {
								input {
									data
									nested {
										data
										nested {
											data
										}
									}
								}
							}
						}
					`,
					variables: {
						input: {
							data: "foo",
							nested: {
								data: "inner"
							}
						}
					},
					result: "inner"
				})
			},
			{
				name: "pass on token as string",
				args: () => ({
					url: graphUrl,
					query: `
						query($input: test_returns_input) {
							test_returns(input: $input) {
								input {
									data
								}
								headers {
									authorization
								}
							}
						}
					`,
					token: "my token",
					variables: {
						input: {
							data: "foo"
						}
					},
					result: {
						test_returns: {
							input: {
								data: "foo"
							},
							headers: {
								authorization: "Bearer my token"
							}
						}
					}
				})
			},
			{
				name: "pass on token as function",
				args: () => ({
					url: graphUrl,
					query: `
						query($input: test_returns_input) {
							test_returns(input: $input) {
								input {
									data
								}
								headers {
									authorization
								}
							}
						}
					`,
					token: async () => "my async token",
					variables: {
						input: {
							data: "foo"
						}
					},
					result: {
						test_returns: {
							input: {
								data: "foo"
							},
							headers: {
								authorization: "Bearer my async token"
							}
						}
					}
				})
			},
			{
				name: "utilize operationName if passed",
				args: {
					query: `
						query first {
							test_books {
								success
							}
						}

						query second {
							test_books {
								message
							}
						}
					`,
					operationName: "second",
					result: {
						test_books: {
							message: "messageValue"
						}
					}
				}
			},
			{
				name: "have functioning scalars via parseLiteral",
				args: {
					key: "test_scalar",
					query: `
						query {
							test_scalar(id: "input_value") {
								id
								test_scalar
							}
						}
					`,
					result: {
						id: "input_value parseLiteral",
						test_scalar: "output serialized"
					}
				}
			},
			{
				name: "have functioning scalars via parseValue",
				args: {
					key: "test_scalar",
					query: `
						query($id: test_scalar) {
							test_scalar(id: $id) {
								id
								test_scalar
							}
						}
					`,
					variables: {
						id: "input_value"
					},
					result: {
						id: "input_value parseValue",
						test_scalar: "output serialized"
					}
				}
			},
			{
				name: "have functioning directives",
				args: {
					key: "test_directive_upper",
					query: `
						query {
							test_directive_upper(id: "test")
						}
					`,
					result: "TEST"
				}
			},
			{
				name: "should load ts files",
				args: {
					key: "test_ts",
					query: `
						query {
							test_ts
						}
					`,
					result: true
				}
			},
			{
				name: "should handle loaders",
				args: {
					key: "test_loader",
					query: `
						query {
							test_loader
						}
					`,
					result: true
				}
			}
		]

		testArray(tests, async function(test) {
			const url = test.url ?? graphUrl;

			let rtn;
			try {
				rtn = await query({
					query: test.query,
					url,
					variables: test.variables,
					clean: test.clean,
					key: test.key,
					token: test.token,
					operationName: test.operationName
				});
			} catch (e) {
				const err = e as Error;
				assert.notStrictEqual(test.error, undefined, err);
				assert.strictEqual(err.message, test.error);
				return;
			}

			deepCheck(rtn, test.result);
		});
	});
});
