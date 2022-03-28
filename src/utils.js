const axios = require("axios");
const get = require("lodash/get");
const fs = require("fs");
let httpsAgent;

const isNode = typeof window === "undefined";

if (isNode) {
	const https = require("https");
	httpsAgent = new https.Agent({
		keepAlive : true
	});
}

/**
 * Queries a graphql server
 * @param {object} args
 * @param {string} args.query
 * @param {object} [args.variables]
 * @param {string} args.url
 * @param {string} [args.token]
 * @param {object} [args.headers]
 * @param {string} [args.key] - Whether to reach and return a specific sub-key of the return.
 * @param {boolean} [args.clean=false] - Whether to automatically run nullToUndefined on the result set to clean it.
 * @param {number} [args.timeout]
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
			method : "post",
			headers,
			maxContentLength: Infinity,
			maxBodyLength : Infinity,
			data : {
				query,
				variables
			},
			httpsAgent : httpsAgent,
			timeout
		});
	} catch(e) {
		if (e.response && e.response.data && e.response.data.errors !== undefined) {
			throw new Error(e.response.data.errors.map(val => val.message).join(", "));
		}

		throw e;
	}

	if (response.data.errors !== undefined) {
		var err = new Error(response.data.errors.map(val => val.message).join(", "));
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

function isPlainObject(obj) {
	return Object.getPrototypeOf(obj) === Object.prototype;
}

// Take an object with null values and recursively drop the null values. Useful for cleaning up graphQL responses.
function nullToUndefined(obj) {
	if (obj instanceof Array) {
		for(let [key, val] of Object.entries(obj)) {
			if (val === null) {
				const index = obj.indexOf(val);
				obj.splice(index, 1);
			} else {
				nullToUndefined(val);
			}
		}
	} else {
		for(let i in obj) {
			if (obj[i] === null) {
				delete obj[i];
			} else if (obj[i] instanceof Array) {
				nullToUndefined(obj[i]);
			} else if (isPlainObject(obj[i])) {
				nullToUndefined(obj[i]);
			}
		}
	}
}

/**
 * Finds all files in a folder matching a regex.
 * @param {string} dir - Directory to load files from
 * @param {RegExp} regex - Criteria to match files on
 */
 async function readdirRegex(dir, regex) {
	const files = await fs.promises.readdir(dir);
	const rtn = files.filter((file) => {
		return file.match(regex) !== null;
	});
	return rtn;
}

module.exports = {
	isPlainObject,
	query,
	nullToUndefined,
	readdirRegex
}