import { testArray, TestDef } from "@simpleview/mochalib";
import nullToUndefined from "../lib/nullToUndefined";
import { deepStrictEqual } from "assert";

describe(__filename, function() {
	interface Test {
		item: any
		result: any
	}

	const tests: TestDef<Test>[] = [
		{
			name: "top level",
			args: {
				item: {
					name: "Test",
					imageUrl: null
				},
				result: {
					name: "Test"
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
						user: {}
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
								name: "image",
								test: {
									foo: "test"
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
		{
			name: "should allow undefined keys to remain",
			args: {
				item: {
					foo: "fooValue",
					nullish: null,
					bar: undefined,
					baz: {
						bazInner: "bazContent",
						arr: ["test", undefined, "test2"]
					}
				},
				result: {
					foo: "fooValue",
					bar: undefined,
					baz: {
						bazInner: "bazContent",
						arr: ["test", undefined, "test2"]
					}
				}
			}
		}
	]

	testArray(tests, function(test) {
		nullToUndefined(test.item);
		deepStrictEqual(test.item, test.result);
	});
});
