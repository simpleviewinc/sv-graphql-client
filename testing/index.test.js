const { GraphServer, query, isPlainObject, nullToUndefined } = require("../");
const assert = require("assert");
const mochaLib = require("@simpleview/mochalib");

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
		var tests = [
			
		]
		
		// TODO
	});
	
	describe("query", function() {
		var tests = [
			
		]
		
		// TODO
	});
});