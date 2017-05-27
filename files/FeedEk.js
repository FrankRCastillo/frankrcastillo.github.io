   /*
	* FeedEk jQuery RSS/ATOM Feed Plugin v3.0 with YQL API
	* http://jquery-plugins.net/FeedEk/FeedEk.html  https://github.com/enginkizil/FeedEk
	* Author : Engin KIZIL http://www.enginkizil.com   
	*/

(function ($) {
    $.fn.FeedEk = function (opt) {
        var def = $.extend({
            MaxCount: 5,
            ShowDesc: true,
            ShowPubDate: true,
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
			var YQLstr = 'SELECT * FROM feednormalizer WHERE url ="' + def.FeedUrl + '" LIMIT ' + def.MaxCount;
		} else {
			var YQLstr = 'SELECT channel.item FROM feednormalizer WHERE output="rss_2.0" AND url ="' + def.FeedUrl + '" LIMIT ' + def.MaxCount;
		};
		
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
					var dteOpt = { year: '2-digit', month: '2-digit', day: '2-digit'};
					if (isYouTube){
						var rssDate = itm.published;
						var rssLink = 'https://www.youtube.com/watch?v=' + itm.videoId;
						var rssTitle = itm.title;
						if (def.ShowPubDate){
							dt = new Date(rssDate);
							dateVal = dt.toLocaleDateString(def.DateFormatLang, dteOpt);
						}
					} else {
						var rssDate = itm.channel.item.pubDate;
						var rssLink = itm.channel.item.link;
						var rssTitle = itm.channel.item.title;
						if (def.ShowPubDate){
							dt = new Date(rssDate);
							if ($.trim(def.DateFormat).length > 0) {
								try {
									moment.lang(def.DateFormatLang);
									dateVal = moment(dt).format(def.DateFormat);
								}
								catch (e){dateVal = dt.toLocaleDateString(def.DateFormatLang, dteOpt);}                            
							}
							else {
								dateVal = dt.toLocaleDateString(def.DateFormatLang, dteOpt);
							}
						}
					};
					if (def.CharLimit > 0 && rssTitle.length > def.CharLimit) {
						var modRssTitle = rssTitle.substring(0, def.CharLimit) + '...';
					} else {
						var modRssTitle = rssTitle;
					}
					s += '<li><div class="fTle">' +
					dateVal + ': ' +
					'<a href="' +
						rssLink +
						'" target="' +
						def.TitleLinkTarget +
						'" >' +
						modRssTitle +
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