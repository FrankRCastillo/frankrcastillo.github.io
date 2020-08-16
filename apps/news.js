// |apps|news|RSS feed from various news sources

export function news() {
    var out = document.getElementById('outtext');
    var div = document.getElementById('newsdiv');
    var pnl = document.getElementById('newspnl');

    if (out != null) {
        switch (out.style.display) {
            case 'none':
                clear();
                home();
                out.style.display   = 'block';
                div.style.height    = '90px';
                pnl.style.overflowY = 'hidden';
                break;

            default:
                out.style.display   = 'none';
                div.style.height    = 'calc(100% - 20px)';
                pnl.style.overflowY = 'auto';
                break;
        }
    }
}

export async function getNewsFeed() {
    var src = await readFile('/apps/news/news.txt');
    var url = src.split('\n').filter(x => x != '');
    var dwn = url.map(async x => await readFile(x).then(k => rssParser(k)));
    var xml = await Promise.all(dwn);
    var tmp = [].concat.apply([], xml);

    tmp.sort((a,b,) => Date.parse(b[1]) - Date.parse(a[1]));

    var arr = tmp.map(x => [ x[0]
                           , new Intl.DateTimeFormat( 'en-US'
                             , { month  : '2-digit'
                               , day    : '2-digit'
                               , hour   : '2-digit'
                               , minute : '2-digit'
                               , hour12 : false
                               }).format(new Date(x[1]))
                                 .replace(',', '')
                           , x[2]
                           , x[3]
                           ]);
    var tbl = arrayToTable(arr, false, true)

    tbl.setAttribute('id', 'NewsTable');

    return tbl;
}
