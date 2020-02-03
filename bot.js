var config = require('./config/config.js');
var Auth = require('./src/Auth.js');
var Messages = require('./src/Messages.js');

var auth = new Auth(config);
auth.authorize()
	.then(function(api)
	{
		var messages = new Messages(api);
		messages.run();
	});
