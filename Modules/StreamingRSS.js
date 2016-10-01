const getRSS = require("./../Modules/RSS.js");
const prettyDate = require("./../Modules/PrettyDate.js");

// Send streaming RSS updates for a server
module.exports = (bot, winston, svr, feedDocument, callback) => {
	getRSS(winston, feedDocument.url, 100, (err, articles) => {
        if(!err && articles && articles.length>0 && articles[0]) {
            var info = [];
            if(feedDocument.streaming.last_article_title!=articles[0].link) {
                var getNewArticles = forceAdd => {
                    var adding = forceAdd;
                    for(var i=articles.length-1; i>=0; i--) {
                        if(articles[i].link==feedDocument.streaming.last_article_title) {
                            adding = true;
                        } else if(adding) {
                            info.push((articles[i].published instanceof Date ? ("`" + prettyDate(articles[i].published) + "`") : "") + " **"  + articles[i].title + "**\n" + articles[i].link + "\n");
                        }
                    }
                };
                getNewArticles(feedDocument.streaming.last_article_title=="");
                info.slice(1);
                if(info.length==0) {
                    getNewArticles(true);
                }
            }

            if(info.length>0) {
                feedDocument.streaming.last_article_title = articles[0].link;
                feedDocument.save(err => {
                    if(err) {
                        winston.error("Failed to save data for RSS feed '" + feedDocument.name + "'", {svrid: svr.id}, err);
                    }
                });
                winston.info(info.length + " new in feed " + feedDocument.name + " on server '" + svr.name + "'", {svrid: svr.id});
                for(var i=0; i<feedDocument.streaming.enabled_channel_ids.length; i++) {
                    var ch = svr.channels.get(feedDocument.streaming.enabled_channel_ids[i]);
                    if(ch) {
                        bot.sendArray(ch, ["__" + info.length + " new in feed `" + feedDocument.name + "`:__"].concat(info));
                    }
                }
            }
        }
        callback();
    });
};