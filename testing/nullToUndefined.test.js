//@ts-check
const { testArray } = require("@simpleview/mochalib");
const { deepCheck } = require("@simpleview/assertlib");
const nullToUndefined = require("../src/utils/nullToUndefined");

describe(__filename, function() {
	const tests = [
		{
			name: "top level",
			args: {
				item: {
					name: "Test",
					imageUrl: null
				},
				result: {
					name: "Test",
					imageUrl: undefined
				}
			}
		},
		{
			name: "multiple level deep",
			args: {
				item: {
					assets: {
						imageUrl: null,
						user: {
							name: null
						}
					}
				},
				result: {
					assets: {
						imageUrl: undefined,
						user: {
							name: undefined
						}
					}
				}
			}
		},
		{
			name: "recursive inside an array",
			args: {
				item: {
					name: "Test",
					assets: {
						items: [
							"image",
							"1100px x 2000px",
							null
						]
					}
				},
				result: {
					name: "Test",
					assets: {
						items: [
							"image",
							"1100px x 2000px"
						]
					}
				}
			}
		},
		{
			name: "root element is empty array",
			args: {
				item: [],
				result: []
			}
		},
		{
			name: "root element is array one null",
			args: {
				item: [null],
				result: []
			}
		},
		{
			name: "root element is array multiple nulls",
			args: {
				item: ["foo", null, "bar", null],
				result: ["foo", "bar"]
			}
		},
		{
			name: "nested inside an array with one null value",
			args: {
				item: {
					assets: {
						items: [
							"image",
							null,
							"1100px x 2000px"
						]
					}
				},
				result: {
					assets: {
						items: [
							"image",
							"1100px x 2000px"
						]
					}
				}
			}
		},
		{
			name: "nested inside an array with multiple null values",
			args: {
				item: {
					assets: {
						items: [
							"image",
							null,
							"1100px x 2000px",
							null
						]
					}
				},
				result: {
					assets: {
						items: [
							"image",
							"1100px x 2000px"
						]
					}
				}
			}
		},
		{
			name: "nested inside an array with one object",
			args: {
				item: {
					name: "Test",
					assets: {
						items: [
							{
								imageUrl: null,
								name: "image"
							},
							null
						]
					}
				},
				result: {
					name: "Test",
					assets: {
						items: [
							{
								imageUrl: undefined,
								name: "image"
							}
						]
					}
				}
			}
		},
		{
			name: "recursive inside an array of multiple objects",
			args: {
				item: {
					name: "Test",
					assets: {
						items: [
							{
								imageUrl: null,
								name: "image",
								test: {
									foo: "test",
									nullKey: null
								},
								test2: {
									foo: null
								}
							},
							"1100px x 2000px",
							null,
							{ test: null }
						]
					}
				},
				result: {
					name: "Test",
					assets: {
						items: [
							{
								imageUrl: undefined,
								name: "image",
								test: {
									foo: "test",
									nullKey: undefined
								},
								test2: {}
							},
							"1100px x 2000px",
							{}
						]
					}
				}
			}
		},
		{
			name: "recursive inside an array of multiple objects that contain an array with multiple null items",
			args: {
				item: {
					name: "Test",
					assets: {
						items: [
							{
								imageUrl: null,
								name: "image",
								test: {
									foo: "test",
									testArray: [
										null,
										"item 2",
										"item 3",
										null
									]
								},
								test2: {
									foo: null
								}
							},
							"1100px x 2000px",
							null,
							{
								test: [
									null
								]
							}
						]
					}
				},
				result: {
					name: "Test",
					assets: {
						items: [
							{
								imageUrl: undefined,
								name: "image",
								test: {
									foo: "test",
									testArray: [
										"item 2",
										"item 3",
									]
								},
								test2: {}
							},
							"1100px x 2000px",
							{ test: [] }
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
