const { GraphServer, query, isPlainObject, nullToUndefined } = require("../");
const assert = require("assert");
const mochaLib = require("@simpleview/mochalib");
const { testArray } = require("@simpleview/mochalib");
const { deepCheck } = require("@simpleview/assertlib");
const server = require("./testServer");
const api = require("./apis");

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
	
	describe("nullToUndefined", function() {
		const tests = [
			{
				name : "nullToUndefined top level",
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
				name : "nullToUndefined 2 level deep",
				args : {
					item : {
						name : "Test",
						assets : {
							imageUrl : null,
							user : {
								name: null
							}
						}
					},
					result : {
						name : "Test",
						assets : {
							imageUrl : undefined,
							user : {}
						}
					}
				}
			},
			{
				name : "nullToUndefined 2 level deep not root key",
				args : {
					item : {
						name : "Test",
						assets : {
							items : {
								name : "image",
								size : "1100px x 2000px",
								imageUrl : null
							}
						}
					},
					result : {
						name : "Test",
						assets : {
							items : {
								name : "image",
								size : "1100px x 2000px",
								imageUrl : undefined
							}
						}
					}
				}
			},
			{
				name : "nullToUndefined recursive root key null values",
				args : {
					item : {
						name : "Test",
						assets : {
							items : [null]
						},
						foo : {
							bar : {
								baz : null
							}
						}
					},
					result : {
						name : "Test",
						assets : {
							items: []
						},
						foo: {
							bar: {}
						}
					}
				}
			},
			{
				name : "nullToUndefined recursive inside an array",
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
				name : "nullToUndefined recursive inside an array with multiple null values",
				args : {
					item : {
						name : "Test",
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
				name : "nullToUndefined recursive inside an array with one object",
				args : {
					item : {
						name : "Test",
						assets : {
							items : [
								{
									imageUrl : null,
									name : "image"
								},
								size = "1100px x 2000px",
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
								}, 
								size = "1100px x 2000px"
							]
						}
					}
				}
			},
			{
				name : "nullToUndefined recursive inside an array of multiple objects",
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
								{ }
							]
						}
					}
				}
			},
			{
				name : "nullToUndefined recursive inside an array of multiple objects that contain an array with multiple null items",
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
								{ test : [
									null
								]}
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
		let graphUrl = "";
		before(async () => {
			// start Server
			const rtn = await server.listen().then(({ url }) => {
				graphUrl = url;
				return "Server ready";
			});
			
			assert.strictEqual(rtn, "Server ready");

			// reset data
			const result = await api.test_reset({
				fields : `
					success
				`,
				url : graphUrl
			});

			assert.strictEqual(result.success, true);

		});
		var tests = [
			{
				name : "Query simple query",
				args : {
					query : () => api.test_books({
						fields : `
							success
							books{
								title
								author
							}
						`,
						url : graphUrl
					}),
					result : {
						success: true,
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
			},
			{
				name : "Query mutation with variables success true",
				after : async () => {
					const result = await api.test_reset({
						fields : `
							success
						`,
						url : graphUrl
					});
					
					assert.strictEqual(result.success, true);
				},
				args : {
					query : async () => api.test_books_update({
							fields: `
								success
								books{
									title
									author
								}
							`,
							variables : {
								input : {
									title: "Updated Title", 
									index: "0"
								}
							},
							url : graphUrl
					}),
					result : {
						success: true,
						books: [ 
							{ 
								title: 'Updated Title',
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
			// Query errors
			{
				name : "Query incorrect fields passed",
				args : {
					query : () => api.test_books({
							fields : `
								success
								books{
									title
									author
									bogusKey
								}
							`,
							url : graphUrl
					}),
					error: 'Cannot query field "bogusKey" on type "test_book".'
				}
			},
			{
				name : "Query incorrect graph url",
				args : {
					query : () => api.test_books({
						fields : `
							success
							books {
								title
								author
								bogusKey
							}
						`,
						url : "http://localhost/"
					}),
					error: 'connect ECONNREFUSED 127.0.0.1:80'
				}
			},
			{
				name : "Query incorrect path",
				args : {
					query : () => api.test({
						fields : `
							success
							books{
								title
								author
							}
						`,
						variables : {
							input : {
								title: "Updated Title",
								author: "Updated Author"
							}
						},
						url : graphUrl
					}),
					error: 'api.test is not a function'
				}
			},
			{
				name : "Query missing required variables",
				args : {
					query : () => api.test_books_update({
						fields : `
							success
							books{
								title
								author
							}
						`,
						variables : {
							input : {
								title: "Updated Title",
								author: "Updated Author"
							}
						},
						url : graphUrl
					}),
					error: 'Variable "$input" got invalid value { title: "Updated Title", author: "Updated Author" }; Field value.index of required type String! was not provided.'
				}
			}
		]

		testArray(tests, async function(test) {
			let rtn;
			try {
				rtn = await test.query();
				// console.log("rtn", rtn)
			} catch(e) {
				assert.strictEqual(e.message, test.error);
				return;
			}
			
			deepCheck(rtn, test.result);
		});
	});
});