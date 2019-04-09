const { GraphServer, query, isPlainObject, nullToUndefined } = require("../");
const assert = require("assert");
const mochaLib = require("@simpleview/mochalib");
const { testArray } = require("@simpleview/mochalib");
const { deepCheck } = require("@simpleview/assertlib");

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

		before(async function() {
			const rtn = await testServers.default.auth.reset_data();
			
			assert.strictEqual(rtn.success, true);
		});
		var tests = [
			
		]
		
		// TODO
	});
});