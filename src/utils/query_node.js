//@ts-check
const query_base = require("./query_base");
const https = require("https");

const httpsAgent = new https.Agent({
	keepAlive: true
});

const query = query_base({
	isNode: true,
	httpsAgent
});

module.exports = query;
