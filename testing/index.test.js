const { GraphServer, query, isPlainObject, nullToUndefined } = require("../");
const assert = require("assert");
const mochaLib = require("@simpleview/mochalib");
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
				name : "nullToUndefined only key in object or array that is null should return empty instance of that object or array",
				args : {
					item : {
						name : "Test",
						assets : {
							imageUrl : null
						},
						users : [
							null
						]
					},
					result : {
						name : "Test",
						assets : {},
						users : []
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
				name : "nullToUndefined recursive and an inside an array",
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
				name : "nullToUndefined recursive and an inside an array multiple null values",
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
				name : "nullToUndefined recursive and an inside an array of objects",
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
				name : "nullToUndefined recursive and an inside an array of multiple objects",
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
				name : "nullToUndefined recursive and an inside an array of multiple objects that contain an array with multiple null items",
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
		before(async function() {
		
			const rtn = await server.listen().then(({ url }) => {
				graphUrl = url
				return "Server ready";
			});
			
			assert.strictEqual(rtn, "Server ready");
		});
		var tests = [
			{
				name : "Query all keys",
				args : {
					query : () => query({
						query : `
							{
								books {
									title
									author
								}
							}
						`,
						variables : {},
						url : graphUrl
					}),
					result : {
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
				name : "Query wrong keys (GraphQl Validation)",
				args : {
					query : () => query({
						query : `
							{
								books {
									title
									author
									bogusKey
								}
							}
						`,
						variables : {},
						url : graphUrl
					}),
					error: 'Cannot query field "bogusKey" on type "Book".'
				}
			},

			{
				name : "Query missing required keys",
				args : {
					query : () => query({
						query : `
							{
								books {
									author
								}
							}
						`,
						variables : {},
						url : graphUrl
					}),
					error: 'Cannot query field "bogusKey" on type "Book".'
				}
			},

			{
				name : "Query wrong incorrect graph url",
				args : {
					query : () => query({
						query : `
							{
								books {
									title
									author
									bogusKey
								}
							}
						`,
						variables : {},
						url : "http://localhost/"
					}),
					error: 'Cannot read property \'data\' of undefined'
				}
			},
		]

		testArray(tests, async function(test) {
			let rtn;
			try {
				rtn = await test.query();
				console.log("rtn", rtn)
			} catch(e) {
				assert.strictEqual(e.message, test.error);
				return;
			}
			
			deepCheck(rtn, test.result);
		});
	});
});