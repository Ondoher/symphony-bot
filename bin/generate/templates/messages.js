class Messages {
	constructor(api)
	{
		this.api = api;
	}

	normalizeId(id)
	{
		return '' + id;
	}

	run()
	{
		this.api.feed.on('messages', this.onMessages.bind(this));
		return this.api.user.me()
			.then(function(me)
			{
				this.botId = this.normalizeId(me.id);
				this.me = me;
				return this.api.feed.start();
			}.bind(this));
	}

	removeTags (text, type)
	{
		var reStart = new RegExp('<' + type + '\\b[^>]*>', 'gi');
		var reStop = new RegExp('</' + type + '>', 'gi');
		var reSolo = new RegExp('<' + type + '\\b[^/]*?/>', 'gi');
		text = text.replace(reStart, '');
		text = text.replace(reStop, '');
		text = text.replace(reSolo, '');

		return text;
	}

	stripMessage(text)
	{
			text = text.replace(/\r/g, ' ');
			text = text.replace(/\n/g, ' ');
			text = this.removeTags(text, 'messageML');
			text = this.removeTags(text, 'b');
			text = this.removeTags(text, 'p');
			text = this.removeTags(text, 'div');
			text = this.removeTags(text, 'strong');
			text = this.removeTags(text, 'i');
			text = this.removeTags(text, 'em');
			text = this.removeTags(text, 'br');

			return text;
	}

	onMessages(messages) {
		if (!messages) return;
		messages.forEach(function(message)
		{
			if (message.fromUserId == this.botId) return;

			var streamId = message.payload.messageSent.message.stream.streamId;
			var text = message.payload.messageSent.message.message;
			var stripped = this.stripMessage(text);

		// your code here
			if (stripped.indexOf('/hello') === 0)
			{
				this.api.message.v2.send(streamId, 'messageml', '<messageML>what do you want</messageML>');
			}


		}.bind(this));
	}
}

module.exports = Messages;
