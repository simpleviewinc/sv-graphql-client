import { testArray } from "@simpleview/mochalib";
import { deepStrictEqual } from "assert";

import { schemaLoader } from "../";
import testLoader from "./testLoader";
import testLoaderArray from "./testLoaderArray";

const baseDirectives = [
	"include",
	"skip",
	"deprecated",
	"specifiedBy"
];

const baseTypes = [
	"String",
	"Query",
	"Boolean",
	"__Type",
	"__TypeKind",
	"__Field",
	"__InputValue",
	"__EnumValue",
	"__Directive",
	"__DirectiveLocation",
	"__Schema"
]

const path1QueryFields = [
	"test_books",
	"test_returns",
	"test_ts"
];

const path1Types = [
	"test_book",
	"test_books_filter",
	"test_result",
	"test_return",
	"test_return_headers",
	"test_return_input",
	"test_books_withRequiredValues",
	"test_returns_input"
]

const path2QueryFields = [
	"test_path2"
]

describe(__filename, function() {
	describe("test array", function() {
		const tests = [
			{
				name: "load one path",
				args: {
					paths: [
						`${__dirname}/schemaRoot`,
						`${__dirname}/schemaPath1`
					],
					queryFields: [
						...path1QueryFields
					],
					types: [
						...baseTypes,
						...path1Types
					]
				}
			},
			{
				name: "load multiple paths",
				args: {
					paths: [
						`${__dirname}/schemaRoot`,
						`${__dirname}/schemaPath1`,
						`${__dirname}/schemaPath2`
					],
					queryFields: [
						...path1QueryFields,
						...path2QueryFields
					],
					types: [
						...baseTypes,
						...path1Types
					]
				}
			},
			{
				name: "load scalars",
				args: {
					paths: [
						`${__dirname}/schemaRoot`,
						`${__dirname}/schemaScalars`
					],
					queryFields: [
						"test_scalar"
					],
					types: [
						...baseTypes,
						"test_scalar",
						"test_scalar_result"
					]
				}
			},
			{
				name: "load directives",
				args: {
					paths: [
						`${__dirname}/schemaRoot`,
						`${__dirname}/schemaDirectives`
					],
					queryFields: [
						"test_directive_upper"
					],
					types: [
						...baseTypes
					],
					directives: [
						...baseDirectives,
						"test_directive_upper"
					]
				}
			},
			{
				name: "load with a loader",
				args: {
					paths: [
						`${__dirname}/schemaRoot`,
					],
					loaders: [
						testLoader
					],
					queryFields: [
						"test_loader"
					]
				}
			},
			{
				name: "loader with array loaders",
				args: {
					paths: [
						`${__dirname}/schemaRoot`
					],
					loaders: [
						testLoader,
						testLoaderArray
					],
					queryFields: [
						"test_loader",
						"test_loader_array_1",
						"test_loader_array_2"
					]
				}
			}
		]

		testArray(tests, async function(test) {
			const testDirectives = (test.directives ?? baseDirectives).sort();
			const testTypes = (test.types ?? baseTypes).sort();
			const testQueryFields = test.queryFields.sort();

			const res = await schemaLoader({
				paths: test.paths,
				loaders: test.loaders
			});

			//@ts-expect-error - accessing private variable
			const directives = res._directives.map(val => val.name).sort();
			//@ts-expect-error - accessing private variable
			const queryFields = Object.keys(res._queryType._fields).sort();
			//@ts-expect-error - access private variable
			const types = Object.keys(res._typeMap).sort();

			deepStrictEqual(types, testTypes);
			deepStrictEqual(queryFields, testQueryFields);
			deepStrictEqual(directives, testDirectives);
		});
	});
});
