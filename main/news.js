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
                           , new Date(x[2]).toString('MM/DD HH:MMZ')
                           , x[3]
                           ]);

    var tbl = ArrayToTable(tmp, false, true);
    clear();
    document.getElementById('outtext').appendChild(tbl);
    CmdReady();
}
