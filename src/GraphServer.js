const { validate } = require("jsvalidator");

/**
 * @typedef GraphServerPrefixObj
 * @property {function} prefix - The Class that handles this prefix.
 * @property {string} graphUrl - The graphURL for this specific prefix.
 */

/**
 * @typedef {function|GraphServerPrefixObj} GraphServerPrefix
*/

/**
 * @typedef GraphServerArgs
 * @property {string} graphUrl
 * @property {GraphServerPrefix[]} prefixes
 * @property {Object} context
 * @property {string} context.token
 * @property {string} context.acct_id
 */

/**
 * @class
 * @param {GraphServerArgs} args
 */
function GraphServer({ graphUrl, prefixes, context = {} }) {
	// Add some code to provide syntax completion if the prefix is locally installed
	/** @type {import("../../sv-auth-client/src/prefixes/AuthPrefix")} auth */
	this.auth;
	/** @type {import("../../sv-auth-client/src/prefixes/AdminPrefix")} */
	this.admin;
	/** @type {import("../../sv-email-client/src/prefixes/EmailPrefix")} */
	this.email;
	/** @type {import("../../sv-geo-client/src/prefixes/GeoPrefix")} */
	this.geo;
	/** @type {import("../../cms-admin-client/src/prefixes/CmsAdminPrefix") */
	this.cmsAdmin;

	this.context = context;
	
	prefixes.forEach(Prefix => {
		const normalizedPrefix = Prefix instanceof Function ? {
			prefix : Prefix,
			graphUrl
		} : Prefix;

		validate(normalizedPrefix, {
			type : "object",
			schema : [
				{ name : "prefix", type : "function", required : true },
				{ name : "graphUrl", type : "string", required : true }
			],
			allowExtraKeys : false,
			throwOnInvalid : true
		});

		const prefix = new normalizedPrefix.prefix({
			graphUrl : normalizedPrefix.graphUrl,
			graphServer : this
		});
		
		this[prefix.name] = prefix;
	});
}

module.exports = GraphServer;