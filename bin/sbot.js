#!/usr/bin/env node

var Q = require('q');
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var ncp = require('ncp');
var mootools = require('mootools');
var child = require('child_process');
var forge = require('node-forge');

var thisDir = path.dirname(module.filename) + '/';

function unDos(filepath)
{
	filepath = path.resolve(filepath);

/*	if (filepath.indexOf(':') == 1)
	{
		filepath = filepath.slice(2);
	}
*/
	filepath = filepath.replace(/\\/g, '/');
	return filepath;
}

thisDir = unDos(thisDir) + '/';
var params = argv._;
//console.log(params);

function outputInstructions()
{
	var instructions = fs.readFileSync(thisDir + 'instructions.txt', {encoding:'ascii'});
	console.log(instructions);
};

function outputConclusion()
{
	var botName = params[2];

	var message = `
Your bot has been created. Before you can use this bot, you will need
to use the admin console to add your service user account for your bot,
'${botName}'. The public RSA key for your bot can be found in the file
'./config/config.js`;

	console.log(message);
};

var commands = ['generate'];

if (params.length == 0) return outputInstructions();
if (commands.indexOf(params[0]) == -1) return outputInstructions();

switch (params[0])
{
	case 'generate':
		if (params.length != 3) return outputInstructions()
		break;
}

function replaceNames(text, names)
{
	Object.each(names, function(value, name)
	{
		var regEx = new RegExp('\{' + name + '\}', 'g');
		text = text.replace(regEx, value);
	});

	return text;
}

function processOne(folder, spec, names)
{
	var fullPath = unDos(fs.realpathSync('./') + '/' + spec.path);
	var justPath = path.dirname(fullPath);
	var templateFile = thisDir + folder + '/templates/' + spec.template;

	mkdirp.sync(justPath);

// do not overwrite existing files
	if (fs.existsSync(fullPath)) return;

	template = fs.readFileSync(templateFile, {encoding: 'utf-8'});
	template = replaceNames(template, names);

	fs.writeFileSync(fullPath, template);
}

function processManifest(folder, names)
{
	var manifestFile = thisDir + folder + '/manifest.js';
	var manifest = require(manifestFile);

	manifest.files.each(function(spec)
	{
		spec.path = replaceNames(spec.path, names);
		processOne(folder, spec, names);
	});
}

function getNames(params, defaultName)
{
	var app = params[1];

	var result = {}
	result.App = app.replace(/-/g, ' ').capitalize().replace(/ /g, '')
	result.aPp = app.camelCase(app.replace(/-/g, ' '));
	result.APP = app.toUpperCase().replace(/-/g, '_');;
	result.app = app;

	return result;
}

function getPath(params, which)
{
	var path = (params.length > which)?'':params[1];
	if (params.length != which + 1) return path;
	path += '/' + params[which];

	return path;
}

function createConfig()
{
	var rsa = forge.pki.rsa;
	var deferred = Q.defer();
	var botName = params[2];

	var configPath = unDos(fs.realpathSync('./') + '/config/config.js');
	var justPath = path.dirname(configPath);
	if (fs.existsSync(configPath)) return Q(true);
	mkdirp.sync(justPath);

	console.log('generating keys...');

	rsa.generateKeyPair({bits: 4096, workers: 2}, function(err, keypair) {
		console.log('...done');
		var pki = forge.pki;

		var privatePem = pki.privateKeyToPem(keypair.privateKey, 64);
		var publicPem = pki.publicKeyToPem(keypair.publicKey, 64);
		var config = `
fs = require('fs');

var authServer = 'develop-api.symphony.com';
var server = 'develop.symphony.com';

module.exports = {
	urls: {
		keyUrl: 'https://' + authServer + ':8444/keyauth',
		sessionUrl: 'https://' + authServer + ':8444/sessionauth',
		agentUrl: 'https://' + server + ':443/agent',
		podUrl: 'https://' + server + ':443/pod',
		loginUrl: 'https://' + server + ':443/login',
		relayUrl: 'https://' + server + ':443/relay',
	},

	rsaAuth: {
		privateKey: \`${privatePem}\`,
		publicKey: \`${publicPem}\`,
		userName: '${botName}',
	},

	certAuth: {
		cert: fs.readFileSync(__dirname + '/certs/cert.pem', {encoding: 'utf-8'}),
		key: fs.readFileSync(__dirname + '/certs/key.pem', {encoding: 'utf-8'}),
		passphrase: '',
	},
}`;

		fs.writeFileSync(configPath, config);

		deferred.resolve(configPath);
	});

	return deferred.promise;
}

switch (params[0])
{
	case 'generate':
		createConfig()
			.then(function()
			{
				var names = getNames(params);
				names.cwd = process.cwd();
				names.path = getPath(params, 2);
				processManifest('generate', names);
				console.log('installing dependencies...');
				child.execSync('npm install');
				outputConclusion();
			});
		break;
}
