// |apps|news|RSS feed from various news sources

export async function news() {
    var src = await ReadFile('/main/news/news.txt');
    var url = src.split('\n');
    var arr = [];

    for (var i = 0; i < url.length; i++) {
        try {
            var xml = await ReadFile(url[i]);
            var tmp = RSSParser(xml);

            for (var j = 0; j < tmp.length; j ++) {
                arr.push(tmp[j]);
            }
        } catch {
            console.log(url[i] + ' not available');
        }
    }

    arr.sort((a, b) => Date.parse(b[2]) - Date.parse(a[2]));
    
    var tmp = arr.map(x => [ x[0]
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

    var tbl = ArrayToTable(tmp, false, true);
    tbl.setAttribute('id', 'NewsTable');
    clear();
    document.getElementById('outtext').appendChild(tbl);
    CmdReady();
}
