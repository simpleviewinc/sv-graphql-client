import axios, { AxiosError, AxiosResponse } from "axios";
import nullToUndefined from "./nullToUndefined";
import get from "lodash/get";
import { isNode } from "browser-or-node";
import pMemoize from "p-memoize-cjs";
import type { Agent as HttpsAgent } from "https";
import type { Agent as HttpAgent } from "http";

async function getAgent(type: "http" | "https") {
	// This hack is to ensure that when this code is loaded in a webpack environment it doesn't recurse into the require("https") call
	// Forcing the front-end to load the https module
	const requireDynamically = eval("require");
	const { Agent } = requireDynamically(type);

	return new Agent({
		keepAlive: true,
		keepAliveMsecs: 60_000
	});
}

const getAgentMemo = pMemoize(getAgent);

export interface QueryOptions {
	query: string
	variables?: Record<string, any>
	url: string
	token?: string | (() => string) | (() => Promise<string>)
	headers?: Record<string, any>
	/** Whether to reach into the return data and return a specific sub-key of the return. */
	key?: string
	/** Whether to automatically run nullToUndefined on the result set to clean it. */
	clean?: boolean
	timeout?: number
	/** Name of the operation if passing multiple in one query */
	operationName?: string
}

export default async function query<T = any>({
	query,
	variables,
	url,
	token,
	headers = {},
	key,
	clean = false,
	timeout,
	operationName
}: QueryOptions): Promise<T> {
	let httpsAgent: HttpsAgent | undefined = undefined;
	let httpAgent: HttpAgent | undefined = undefined;

	if (isNode) {
		httpsAgent = await getAgentMemo("https");
		httpAgent = await getAgentMemo("http");
	}

	if (token) {
		// If the token is a function, we call it to get the actual token
		if (token instanceof Function) {
			token = await token();
		}

		headers.Authorization = `Bearer ${token}`
	}

	if (isNode && headers["accept-encoding"] === undefined) {
		// in node add a gzip header to return transmission size for larger payloads
		headers["accept-encoding"] = "gzip";
	}

	let response: AxiosResponse;
	try {
		response = await axios({
			url,
			method: "post",
			headers,
			maxContentLength: Infinity,
			maxBodyLength: Infinity,
			data: {
				query,
				variables,
				operationName
			},
			httpsAgent,
			httpAgent,
			timeout
		});
	} catch (e) {
		const err = e as AxiosError;
		if (err.response?.data?.errors !== undefined) {
			throw new Error(err.response.data.errors.map(val => val.message).join(", "));
		}

		throw e;
	}

	if (response.data.errors !== undefined) {
		const err = new Error(response.data.errors.map(val => val.message).join(", "));
		//@ts-expect-error - It doesn't like us adding a key to error, but not sure what to do
		err.graphQLErrors = response.data.errors;
		throw err;
	}

	let result = response.data.data;

	if (clean === true) {
		nullToUndefined(result);
	}

	if (key !== undefined) {
		result = get(result, key);
	}

	return result;
}
