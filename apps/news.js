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
                out.style.display  = 'block';
                div.style.height   = '120px';
                pnl.style.overflow = 'hidden';
                break;

            default:
                out.style.display  = 'none';
                div.style.height   = 'calc(100% - 55px)';
                pnl.style.overflow = 'auto';
                break;
        }
    }
}

export async function getNewsFeed() {
    var src = await readFile('/apps/news/news.txt');
    var url = src.split('\n').filter(x => x != '');
    var xml = await Promise.all(url.map(async (x) => readFile(x)));
    var par = xml.map(x => rssParser(x));
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
    var tbl = arrayToTable(arr, false, true)

    tbl.setAttribute('id', 'NewsTable');

    return tbl;
}
