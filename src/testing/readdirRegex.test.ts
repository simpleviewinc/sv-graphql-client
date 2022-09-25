import { testArray } from "@simpleview/mochalib";
import assert from "assert";

import readdirRegex from "../lib/readdirRegex";

describe(__filename, function() {
	const tests = [
		{
			name: "find txt",
			args: {
				regex: /.txt$/,
				results: [
					"test1.txt",
					"test2.txt"
				]
			}
		},
		{
			name: "find all",
			args: {
				regex: /.*/,
				results: [
					"test1.txt",
					"test2.txt",
					"test3.js"
				]
			}
		},
		{
			name: "find nothing",
			args: {
				regex: /.bogus$/,
				results: []
			}
		}
	]

	testArray(tests, async function(test) {
		const results = await readdirRegex(`${__dirname}/readdirRegex`, test.regex);
		assert.deepStrictEqual(results, test.results);
	});
});
