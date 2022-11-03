import { validate } from "jsvalidator";
import { QueryOptions } from "./query";

export interface GraphServerPrefixArgs {
	name?: string
	graphUrl: string
	graphServer: GraphServer
}

interface GraphServerPrefixInstance {
	name: string
}

type GraphServerPrefixClass = {
	new (args: GraphServerPrefixArgs): GraphServerPrefixInstance
}

interface GraphServerPrefixObj {
	name?: string
	graphUrl: string
	prefix: GraphServerPrefixClass
}

type GraphServerPrefix = GraphServerPrefixObj | GraphServerPrefixClass

export interface GraphContext {
	token?: QueryOptions["token"]
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
					{ name: "name", type: "string" },
					{ name: "prefix", type: "function", required: true },
					{ name: "graphUrl", type: "string", required: true }
				],
				allowExtraKeys: false,
				throwOnInvalid: true
			});

			const prefix = new normalizedPrefix.prefix({
				name: normalizedPrefix.name,
				graphUrl: normalizedPrefix.graphUrl,
				graphServer: this
			});

			// make it available at the passed name or the one coming from the Prefix class
			this[normalizedPrefix.name ?? prefix.name] = prefix;
		});
	}
}

export default GraphServer;
