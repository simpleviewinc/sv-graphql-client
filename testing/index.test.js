const { GraphServer, nullToUndefined, query } = require("../");
const assert = require("assert");
const { testArray } = require("@simpleview/mochalib");
const { deepCheck } = require("@simpleview/assertlib");
const server = require("./testServer");

describe(__filename, function() {
	it("should boot a graphServer with context", async function() {
		const TestPrefix = function(args) {
			this.name = "test";
			this.graphUrl = args.graphUrl;
			this.graphServer = args.graphServer;
		}

		TestPrefix.prototype.doSomething = async function() {
			return `true_${this.graphServer.context.hax}`;
		}

		const graphServer = new GraphServer({
			graphUrl : "http://fake.com/",
			prefixes : [TestPrefix]
		});

		assert.strictEqual(graphServer.test.graphServer, graphServer);

		let result = await graphServer.test.doSomething();
		assert.strictEqual(result, "true_undefined");
		graphServer.context.hax = "testing";
		result = await graphServer.test.doSomething();
		assert.strictEqual(result, "true_testing");
	});

	it("should boot a graphServer with different urls for different prefixes", async function() {
		const PrefixOne = function(args) {
			this.name = "one";
			this.graphUrl = args.graphUrl;
		}

		const PrefixTwo = function(args) {
			this.name = "two";
			this.graphUrl = args.graphUrl;
		}

		const g = new GraphServer({
			graphUrl : "https://www.google.com/",
			prefixes : [
				{
					prefix : PrefixOne,
					graphUrl : "https://www.bing.com/"
				},
				PrefixTwo
			]
		});

		assert.strictEqual(g.one.graphUrl, "https://www.bing.com/");
		assert.strictEqual(g.two.graphUrl, "https://www.google.com/");
	})

	describe("nullToUndefined", function() {
		const tests = [
			{
				name : "top level",
				args : {
					item : {
						name : "Test",
						imageUrl : null
					},
					result : {
						name : "Test",
						imageUrl : undefined
					}
				}
			},
			{
				name : "multiple level deep",
				args : {
					item : {
						assets : {
							imageUrl : null,
							user : {
								name: null
							}
						}
					},
					result : {
						assets : {
							imageUrl : undefined,
							user : {
								name : undefined
							}
						}
					}
				}
			},
			{
				name : "recursive inside an array",
				args : {
					item : {
						name : "Test",
						assets : {
							items : [
								"image",
								"1100px x 2000px",
								null
							]
						}
					},
					result : {
						name : "Test",
						assets : {
							items : [
								"image",
								"1100px x 2000px"
							]
						}
					}
				}
			},
			{
				name : "root element is empty array",
				args : {
					item : [],
					result : []
				}
			},
			{
				name : "root element is array one null",
				args : {
					item : [null],
					result : []
				}
			},
			{
				name : "root element is array multiple nulls",
				args : {
					item : ["foo", null, "bar", null],
					result : ["foo", "bar"]
				}
			},
			{
				name : "nested inside an array with one null value",
				args : {
					item : {
						assets : {
							items : [
								"image",
								null,
								"1100px x 2000px"
							]
						}
					},
					result : {
						assets : {
							items : [
								"image",
								"1100px x 2000px"
							]
						}
					}
				}
			},
			{
				name : "nested inside an array with multiple null values",
				args : {
					item : {
						assets : {
							items : [
								"image",
								null,
								"1100px x 2000px",
								null
							]
						}
					},
					result : {
						assets : {
							items : [
								"image",
								"1100px x 2000px"
							]
						}
					}
				}
			},
			{
				name : "nested inside an array with one object",
				args : {
					item : {
						name : "Test",
						assets : {
							items : [
								{
									imageUrl : null,
									name : "image"
								},
								null
							]
						}
					},
					result : {
						name : "Test",
						assets : {
							items : [
								{
									imageUrl : undefined,
									name :"image"
								}
							]
						}
					}
				}
			},
			{
				name : "recursive inside an array of multiple objects",
				args : {
					item : {
						name : "Test",
						assets : {
							items : [
								{
									imageUrl : null,
									name : "image",
									test : {
										foo : "test",
										nullKey: null
									},
									test2 : {
										foo : null
									}
								},
								"1100px x 2000px",
								null,
								{ test : null }
							]
						}
					},
					result : {
						name : "Test",
						assets : {
							items : [
								{
									imageUrl : undefined,
									name :"image",
									test : {
										foo : "test",
										nullKey : undefined
									},
									test2 : {}
								},
								"1100px x 2000px",
								{}
							]
						}
					}
				}
			},
			{
				name : "recursive inside an array of multiple objects that contain an array with multiple null items",
				args : {
					item : {
						name : "Test",
						assets : {
							items : [
								{
									imageUrl : null,
									name : "image",
									test : {
										foo : "test",
										testArray: [
											null,
											"item 2",
											"item 3",
											null
										]
									},
									test2 : {
										foo : null
									}
								},
								"1100px x 2000px",
								null,
								{
									test : [
										null
									]
								}
							]
						}
					},
					result : {
						name : "Test",
						assets : {
							items : [
								{
									imageUrl : undefined,
									name :"image",
									test : {
										foo : "test",
										testArray: [
											"item 2",
											"item 3",
										]
									},
									test2 : {}
								},
								"1100px x 2000px",
								{ test : [] }
							]
						}
					}
				}
			},
		]

		testArray(tests, function(test) {
			nullToUndefined(test.item);
			deepCheck(test.item, test.result);
		});
	});

	describe("query", function() {
		let graphUrl;
		before(async () => {
			// start Server
			await server.listen().then(({ url }) => {
				graphUrl = url;
			});
		});

		after(async () => {
			await server.stop();
		});

		var tests = [
			{
				name : "simple query",
				args : () => ({
					url : graphUrl,
					query : `
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
					result : {
						test_books : {
							success: true,
							message : "messageValue",
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
				name : "incorrect fields passed",
				args : () => ({
					url : graphUrl,
					query : `
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
				name : "incorrect graph url",
				args : () => ({
					url : "http://localhost/",
					query : `
						query {
							test_books {
								success
							}
						}
					`,
					error: 'connect ECONNREFUSED 127.0.0.1:80'
				})
			},
			{
				name : "thrown error",
				args : () => ({
					url : graphUrl,
					query : `
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
				name : "auth error",
				args : () => ({
					url : graphUrl,
					query : `
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
				name : "thrown error in nested resolver",
				args : () => ({
					url : graphUrl,
					query : `
						query {
							test_books {
								throw
							}
						}
					`,
					error : "Thrown from throw"
				})
			},
			{
				name : "thrown error in 2 nested resolvers",
				args : () => ({
					url : graphUrl,
					query : `
						query {
							test_books {
								throw
								throw2
							}
						}
					`,
					error : "Thrown from throw, Thrown from throw2"
				})
			},
			{
				name : "with variables",
				args : () => ({
					url : graphUrl,
					query : `
						query($filter: test_books_filter) {
							test_books(filter: $filter) {
								success,
								message
							}
						}
					`,
					variables : {
						filter : {
							message : "Changed"
						}
					},
					result : {
						test_books : {
							success : true,
							message : "Changed"
						}
					}
				})
			},
			{
				name : "missing required variables",
				args : () => ({
					url : graphUrl,
					query : `
						query($filter: test_books_withRequiredValues) {
							test_books(withRequiredValues: $filter) {
								success
							}
						}
					`,
					variables : {
						filter: {}
					},
					error: 'Variable "$filter" got invalid value {}; Field "requiredVal" of required type "String!" was not provided.'
				})
			},
			{
				name : "multiple errors",
				args : () => ({
					url : graphUrl,
					query : `
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
					error : 'Cannot query field "bogus" on type "test_result". Did you mean "books"?, Cannot query field "bogus" on type "test_book".'
				})
			},
			{
				name : "max_body_length and max_content_length",
				timeout : 5000,
				args : () => ({
					url : graphUrl,
					query : `
						query($filter: test_books_filter) {
							test_books(filter: $filter) {
								success,
								message
							}
						}
					`,
					variables : {
						filter : {
							message : 'x'.repeat(15*1024*1024)
						}
					},
					result : {
						test_books : {
							success : true,
							message : 'x'.repeat(15*1024*1024)
						}
					}
				})
			},
			{
				name : "clean out null values",
				args : () => ({
					url : graphUrl,
					clean : true,
					query : `
						query($input: test_returns_input) {
							test_returns(input: $input) {
								data
								nested {
									data
									nested {
										data
									}
								}
							}
						}
					`,
					variables : {
						input : {
							data : "foo",
							nested : {
								data : null,
								nested : {
									data : null
								}
							}
						}
					},
					result : {
						test_returns : {
							data : "foo",
							nested : {
								data : undefined,
								nested : {
									data : undefined
								}
							}
						}
					}
				})
			},
			{
				name : "return null keys if returned",
				args : () => ({
					url : graphUrl,
					query : `
						query($input: test_returns_input) {
							test_returns(input: $input) {
								data
								nested {
									data
									nested {
										data
									}
								}
							}
						}
					`,
					variables : {
						input : {
							data : null,
							nested : null
						}
					},
					result : {
						test_returns : {
							data : null,
							nested : null
						}
					}
				})
			},
			{
				name : "reach into key",
				args : () => ({
					url : graphUrl,
					key : "test_returns.nested.data",
					query : `
						query($input: test_returns_input) {
							test_returns(input: $input) {
								data
								nested {
									data
									nested {
										data
									}
								}
							}
						}
					`,
					variables : {
						input : {
							data : "foo",
							nested : {
								data : "inner"
							}
						}
					},
					result : "inner"
				})
			}
		]

		testArray(tests, async function(test) {
			let rtn;
			try {
				rtn = await query({
					query : test.query,
					url : test.url,
					variables : test.variables,
					clean : test.clean,
					key : test.key
				});
			} catch(e) {
				assert.notStrictEqual(test.error, undefined, e);
				assert.strictEqual(e.message, test.error);
				return;
			}

			deepCheck(rtn, test.result);
		});
	});
});