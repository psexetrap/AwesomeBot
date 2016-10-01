// Methods to begin/stop timing voice activity for stats
module.exports = {
	startTiming: (winston, svr, serverDocument, member) => {
		// Begin timing voice activity
		var voiceDocument = serverDocument.voice_data.id(member.id);
		if(!voiceDocument) {
			serverDocument.voice_data.push({
				_id: member.id,
				started_timestamp: Date.now()
			});
			voiceDocument = serverDocument.voice_data.id(member.id);
		}

		// Set now as the last active time for member
		var memberDocument = serverDocument.members.id(member.id);
		if(!memberDocument) {
			serverDocument.members.push({_id: member.id});
			memberDocument = serverDocument.members.id(member.id);
		}
		memberDocument.last_active = Date.now();

		// Save changes to serverDocument
		serverDocument.save(err => {
			if(err) {
				winston.error("Failed to save server data for voice activity", {svrid: svr.id}, err);
			}
		});
	},
	stopTiming: (bot, winston, svr, serverDocument, member) => {
		// Calculate activity score for voice connection
		var voiceDocument = serverDocument.voice_data.id(member.id);
		if(voiceDocument) {
			var memberDocument = serverDocument.members.id(member.id);
			if(!memberDocument) {
				serverDocument.members.push({_id: member.id});
				memberDocument = serverDocument.members.id(member.id);
			}
			memberDocument.voice += Math.ceil((Date.now() - voiceDocument.started_timestamp)/6000);
			voiceDocument.remove();
			bot.checkRank(winston, svr, serverDocument, member, memberDocument);
		}

		// Save changes to serverDocument
		serverDocument.save(err => {
			if(err) {
				winston.error("Failed to save server data for voice activity", {svrid: svr.id}, err);
			}
		});
	}
};