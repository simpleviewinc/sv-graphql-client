import { validate } from "jsvalidator";

export interface GraphServerPrefixArgs {
	graphUrl: string
	graphServer: GraphServer
}

interface GraphServerPrefixInstance {
	name: string
}

type GraphServerPrefixClass = {
	new ({
		graphUrl,
		graphServer
	}: {
		graphUrl: string
		graphServer: GraphServer
	}): GraphServerPrefixInstance
}

interface GraphServerPrefixObj {
	graphUrl: string
	prefix: GraphServerPrefixClass
}

type GraphServerPrefix = GraphServerPrefixObj | GraphServerPrefixClass

interface GraphContext {
	token?: string
	acct_id?: string
	[key: string]: any
}

class GraphServer {
	context: GraphContext
	// Each prefix is assigned as a root property and I don't know how to Type Def that, yet
	// It needs to somehow be based on the prefixes passed in
	[key: string]: any
	constructor({
		graphUrl,
		prefixes,
		context = {}
	}: {
		graphUrl: string
		prefixes: GraphServerPrefix[]
		context?: GraphContext
	}) {
		this.context = context;

		prefixes.forEach(Prefix => {
			const normalizedPrefix = Prefix instanceof Function ? {
				prefix: Prefix,
				graphUrl
			} : Prefix;

			validate(normalizedPrefix, {
				type: "object",
				schema: [
					{ name: "prefix", type: "function", required: true },
					{ name: "graphUrl", type: "string", required: true }
				],
				allowExtraKeys: false,
				throwOnInvalid: true
			});

			const prefix = new normalizedPrefix.prefix({
				graphUrl: normalizedPrefix.graphUrl,
				graphServer: this
			});

			this[prefix.name] = prefix;
		});
	}
}

export default GraphServer;
