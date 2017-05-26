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
            DescCharacterLimit: 0,
            TitleLinkTarget: "_blank",
            DateFormat: "",
            DateFormatLang:"en"
        }, opt);
        
        var id = $(this).attr("id"), i, s = "", dt, dateVal;
        $("#" + id).empty();
        if (def.FeedUrl == undefined) return;       
        $("#" + id).append('<img src="files/loader.gif" />');

        var YQLstr = 'SELECT channel.item FROM feednormalizer WHERE output="rss_2.0" AND url ="' + def.FeedUrl + '" LIMIT ' + def.MaxCount;

        $.ajax({
            url: "https://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(YQLstr) + "&format=json&diagnostics=false&callback=?",
            dataType: "json",
            success: function (data) {
                $("#" + id).empty();
                if (!(data.query.results.rss instanceof Array)) {
                    data.query.results.rss = [data.query.results.rss];
                }
                $.each(data.query.results.rss, function (e, itm) {
                    if (def.ShowPubDate){
                        dt = new Date(itm.channel.item.pubDate);
                        if ($.trim(def.DateFormat).length > 0) {
                            try {
                                moment.lang(def.DateFormatLang);
                                dateVal = moment(dt).format(def.DateFormat);
                            }
                            catch (e){dateVal = dt.toLocaleDateString();}                            
                        }
                        else {
                            dateVal = dt.toLocaleDateString();
                        }
                    }
					s += '<li><div class="fTle">' +
					dateVal + ': ' +
					'<a href="' + itm.channel.item.link + '" target="' + def.TitleLinkTarget + '" >' + itm.channel.item.title + '</a></div></li>';
                });
                $("#" + id).append('<ul class="fLst">' + s + '</ul>');
            }
        });
    };
})(jQuery);