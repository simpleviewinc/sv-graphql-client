function GraphServer({ graphUrl, prefixes, context = {} }) {
	this.context = context;
	
	prefixes.forEach(Prefix => {
		const prefix = new Prefix({
			graphUrl,
			graphServer : this
		});
		
		this[prefix.name] = prefix;
	});
}

module.exports = GraphServer;