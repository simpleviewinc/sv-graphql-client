const axios = require("axios");
let httpsAgent;

const isNode = typeof window === "undefined";

if (isNode) {
	const https = require("https");
	httpsAgent = new https.Agent({
		keepAlive : true
	});
}

async function query({ query, variables, url, token, headers = {} }) {
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
			httpsAgent : httpsAgent
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
	
	return response.data.data;
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

module.exports = {
	isPlainObject,
	query,
	nullToUndefined
}