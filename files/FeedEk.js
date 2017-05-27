   /*
	* FeedEk jQuery RSS/ATOM Feed Plugin v3.0 with YQL API
	* http://jquery-plugins.net/FeedEk/FeedEk.html  https://github.com/enginkizil/FeedEk
	* Author : Engin KIZIL http://www.enginkizil.com 
	* Forked to support YouTube RSS feeds
	*/

(function ($) {
    $.fn.FeedEk = function (opt) {
        var def = $.extend({
            MaxCount: 5,
            CharLimit: 0,
            TitleLinkTarget: "_blank",
			DateFormat: "",
            DateFormatLang:"en"
        }, opt);
        
        var id = $(this).attr("id"), i, s = "", dt, dateVal;
        $("#" + id).empty();
        if (def.FeedUrl == undefined) return;
        $("#" + id).append('<img src="files/loader.gif"/>');
		
		var isYouTube = urlDomain(def.FeedUrl).includes('youtube.com');
		
		if (isYouTube){
			var YTLSearch = '*';
		} else {
			var YTLSearch = 'channel.item';
		};
		
		var YQLstr = 'SELECT ' + YTLSearch + ' FROM feednormalizer WHERE url ="' + def.FeedUrl + '" LIMIT ' + def.MaxCount;
		
        $.ajax({
            url: "https://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(YQLstr) + "&format=json&diagnostics=false&callback=?",
            dataType: "json",
            success: function (data) {
				$("#" + id).empty();
				
				if (isYouTube){
					var rssResults = data.query.results.feed.entry;
				} else {
					var rssResults = data.query.results.rss;
					if (!(rssResults instanceof Array)) {
						var rssResults = [rssResults];
					};
				};
				
                $.each(rssResults, function (e, itm) {
					if (isYouTube){
						var rssDate = itm.published;
						var rssLink = 'https://www.youtube.com/watch?v=' + itm.videoId;
						var rssTitle = itm.title;
					} else {
						var rssDate = itm.channel.item.pubDate;
						var rssLink = itm.channel.item.link;
						var rssTitle = itm.channel.item.title;
					};
					dt = new Date(rssDate);

					s += '<li><div class="fTle">' +
					'<a href="' + rssLink + '" target="' + def.TitleLinkTarget + '" >' +
						dt.toLocaleDateString(def.DateFormatLang, def.DateFormat) + ': ' +
						truncString(rssTitle, def.CharLimit) +
					'</a></div></li>';
                });
                $("#" + id).append('<ul class="fLst">' + s + '</ul>');
            }
        });
    };
})(jQuery);

function urlDomain (url) {
	if (url.includes('://')) {
		var retUrl = url.split('/')[2];
	} else {
		var retUrl = url.split('/')[0];
	};
	return retUrl;
};

function truncString (text, length) {
	if (length> 0 && text.length > length) {
		var newText = text.substring(0, length) + '...';
	} else {
		var newText = text;
	}
	return newText;
};