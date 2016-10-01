// Bans a member from the server
module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix, commandData) => {
    var query = suffix.substring(0, suffix.lastIndexOf(" "));
    var deleteMessageDays = suffix.substring(suffix.lastIndexOf(" ")+1);

    if(!query || isNaN(deleteMessageDays)) {
        query = suffix;
        deleteMessageDays = 0;
    }
    if(deleteMessageDays<1) {
        deleteMessageDays = 0;
    } else {
        deleteMessageDays = parseInt(deleteMessageDays);
    }

    var member = bot.memberSearch(query, msg.channel.guild);
    if(!query || !member || [msg.author.id, bot.user.id].indexOf(member.id)>-1) {
        winston.warn("Invalid member provided for ban command", {svrid: msg.channel.guild.id, chid: msg.channel.id, usrid: msg.author.id});
        msg.channel.createMessage(msg.author.mention + " Do you want me to ban you? :open_mouth:");
    } else {
        member.ban(deleteMessageDays).then(() => {
            msg.channel.createMessage("Ok, user banned :wave:" + (deleteMessageDays ? ("\nI also deleted their messages from the last " + deleteMessageDays + " days") : ""));
        }).catch(err => {
            winston.error("Failed to ban user '" + member.user.username + "' from server '" + msg.channel.guild.name + "'", {svrid: msg.channel.guild.id, chid: msg.channel.id, usrid: msg.author.id}, err);
            msg.channel.createMessage("I don't have permission to ban on this server :sob:");
        });
    }
}
