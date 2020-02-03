var symphonyApi = require('symphony-api');

class Auth {
	constructor(config)
	{
		this.config = config;
	}

	authenticate(type)
	{
		var urls = this.config.urls;
		var rsaAuth = this.config.rsaAuth;
		var certAuth = this.config.certAuth;
		var api = symphonyApi.create(urls);

		if (type === 'rsa')
		{
			api.setRsa(rsaAuth.privateKey, rsaAuth.publicKey, rsaAuth.userName);
		}
		else
		{
			api.setCerts(certAuth.cert, certAuth.key, certAuth.passphrase);
		}

		api.setLogState(true);

		return api.authenticate()
			.then(function(headers) {
				return api;
			});
	}
}

module.exports = Auth;
