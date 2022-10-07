import { makeExecutableSchema } from "@graphql-tools/schema";
import readdirRegex from "./readdirRegex";
import lodash from "lodash";
import { DocumentNode } from "graphql";
import { IResolvers } from '@graphql-tools/utils';

interface AnyFunc {
	(...args: any): any
}

export interface GraphModule {
	typeDefs?: DocumentNode
	resolvers?: IResolvers<any, any>
	/**
	 * Use this when you want to create schema directives as per @see https://www.graphql-tools.com/docs/schema-directives#implementing-schema-directives
	*/
	schemaTransformers?: AnyFunc[]
}

export interface LoaderFunction {
	(): GraphModule | GraphModule[] | Promise<GraphModule> | Promise<GraphModule[]>
}

/**
 * Generates a schema to be passed to an ApolloServer instance. It can be loaded either with static files from paths or using loader functions.
 *
 * Each file or loader should return a {@link GraphModule}.
 */
export default async function schemaLoader({
	paths = [],
	loaders = []
}: {
	paths?: string[]
	loaders?: LoaderFunction[]
}) {
	const typeDefs: DocumentNode[] = [];
	const resolvers: IResolvers<any, any>[] = [];
	const schemaTransformers: AnyFunc[] = [];
	const defs: GraphModule[] = [];

	for (const path of paths) {
		const dirResult = await readdirRegex(path, /\.[tj]s$/);

		for (const name of dirResult) {
			const temp = require(`${path}/${name}`);
			defs.push(temp);
		}
	}

	for (const loader of loaders) {
		const temp = await loader();
		const arr = temp instanceof Array ? temp : [temp];
		defs.push(...arr);
	}

	for (const def of defs) {
		if (def.typeDefs !== undefined) {
			typeDefs.push(def.typeDefs);
		}

		if (def.resolvers !== undefined) {
			resolvers.push(def.resolvers);
		}

		if (def.schemaTransformers !== undefined) {
			schemaTransformers.push(...def.schemaTransformers);
		}
	}

	let schema = makeExecutableSchema({
		typeDefs,
		resolvers: lodash.merge({}, ...resolvers)
	});

	schemaTransformers.forEach((schemaTransformer) => {
		schema = schemaTransformer(schema);
	});

	return schema;
}
