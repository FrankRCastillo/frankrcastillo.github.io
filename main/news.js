// |apps|news|RSS feed from various news sources

export async function news() {
    var out = document.getElementById('outtext');

    window.interval = setInterval(function() {
        var arr = GetNewsFeed();
        var tbl = ArrayToTable(arr, false, true);
        tbl.setAttribute('id', 'NewsTable');
        clear();
        out.appendChild(tbl);
    }, 60000);
}

async function GetNewsFeed() {
    var src  = await ReadFile('/main/news/news.txt');
    var urls = src.split('\n');
    var arr  = urls.map(function (url) {
        var xml = await ReadFile(url);
        return xml.map(data => RSSParser(data));
    });

    arr.sort((a,b,) => Date.parse(b[2]) - Date.parse(a[2]));

    return arr.map(x => [ x[0]
                        , x[1]
                        , new Intl.DateTimeFormat(
                            'en-US'
                             , { month  : '2-digit'
                               , day    : '2-digit'
                               , hour   : '2-digit'
                               , minute : '2-digit'
                               , hour12 : false
                               }).format(new Date(x[2]))
                                 .replace(',', '')
                        , x[3]
                        ]);
}
