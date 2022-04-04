//@ts-check
const axios = require("axios");
const nullToUndefined = require("./nullToUndefined");
const { get } = require("lodash");

/**
 * @typedef QueryOptions
 * @property {string} query
 * @property {object} [variables]
 * @property {string} url
 * @property {string} [token]
 * @property {object} headers]
 * @property {string} [key] - Whether to reach and return a specific sub-key of the return.
 * @property {boolean} [clean=false] - Whether to automatically run nullToUndefined on the result set to clean it.
 * @property {number} [timeout]
 */

/**
 * Generates a query function based on browser vs node
 * @param {object} options
 * @param {any} [options.httpsAgent]
 * @param {boolean} [options.isNode]
*/
function query_base({
	httpsAgent,
	isNode = false
} = {}) {
	/**
	 * Queries a graphql server
	 * @param {QueryOptions} param0
	 */
	async function query({
		query,
		variables,
		url,
		token,
		headers = {},
		key,
		clean = false,
		timeout
	}) {
		if (token) {
			headers.Authorization = `Bearer ${token}`
		}

		if (isNode && headers["accept-encoding"] === undefined) {
			// in node add a gzip header to return transmission size for larger payloads
			headers["accept-encoding"] = "gzip";
		}

		let response;
		try {
			response = await axios({
				url,
				method: "post",
				headers,
				maxContentLength: Infinity,
				maxBodyLength: Infinity,
				data: {
					query,
					variables
				},
				httpsAgent: httpsAgent,
				timeout
			});
		} catch (e) {
			if (e.response && e.response.data && e.response.data.errors !== undefined) {
				throw new Error(e.response.data.errors.map(val => val.message).join(", "));
			}

			throw e;
		}

		if (response.data.errors !== undefined) {
			const err = new Error(response.data.errors.map(val => val.message).join(", "));
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

	return query;
}

module.exports = query_base;
