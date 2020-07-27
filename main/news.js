// |apps|news|RSS feed from various news sources

export async function news() {
    clear();
    document.getElementById('outtext').appendChild(await GetNewsFeed());

    window.appinterval = setInterval(async function() {
        await news();
    }, 60000);
}

async function GetNewsFeed() {
    var src = await ReadFile('/main/news/news.txt');
    var url = src.split('\n').filter(x => x != '');
    var xml = await Promise.all(url.map(async (x) => ReadFile(x)));
    var par = xml.map(x => RSSParser(x));
    var tmp = [].concat.apply([], par);

    tmp.sort((a,b,) => Date.parse(b[2]) - Date.parse(a[2]));

    var arr = tmp.map(x => [ x[0]
                           , x[1]
                           , new Intl.DateTimeFormat( 'en-US'
                             , { month  : '2-digit'
                               , day    : '2-digit'
                               , hour   : '2-digit'
                               , minute : '2-digit'
                               , hour12 : false
                               }).format(new Date(x[2]))
                                 .replace(',', '')
                           , x[3]
                           ]);
    var tbl = ArrayToTable(arr, false, true)

    tbl.setAttribute('id', 'NewsTable');

    return tbl;
}
