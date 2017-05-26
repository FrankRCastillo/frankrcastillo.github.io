/*
* FeedYt jQuery RSS/ATOM Feed Plugin for YouTube
* forked from FeedEk https://github.com/enginkizil/FeedYt
*/

(function ($) {
    $.fn.FeedYt = function (opt) {
        var def = $.extend({
            MaxCount: 5,
            TitleLinkTarget: "_blank",
            DateFormat: "",
            DateFormatLang:"en"
        }, opt);
        
        var id = $(this).attr("id"), i, s = "", dt;
        $("#" + id).empty();
        if (def.FeedUrl == undefined) return;       
        $("#" + id).append('<img src="files/loader.gif" />');

        var YQLstr = 'SELECT * FROM feednormalizer WHERE url ="' + def.FeedUrl + '" LIMIT ' + def.MaxCount;

        $.ajax({
            url: "https://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(YQLstr) + "&format=json&diagnostics=false&callback=?",
            dataType: "json",
            success: function (data) {
                $("#" + id).empty();
				$.each(data.query.results.feed.entry, function (e, itm) {
					dt = new Date(itm.published);
					date = dt.toLocaleDateString();
                    s += '<li><div class="fTle">' +
						date + ': ' +
						'<a href=https://www.youtube.com/watch?v=' + itm.videoId +
						'" target="' + def.TitleLinkTarget + '" >' +
						itm.title +
						'</a></div></li>';
                });
                $("#" + id).append('<ul class="fLst">' + s + '</ul>');
            }
        });
    };
})(jQuery);
