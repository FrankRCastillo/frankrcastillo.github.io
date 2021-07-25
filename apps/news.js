// |apps|news|RSS feed from letious news sources

export function news() {
    let out = document.getElementById('outtext_' + );
    let div = document.getElementById('newsdiv_' + );
    let pnl = document.getElementById('newspnl_' + );

    if (out != null) {
        switch (out.style.display) {
            case 'none':
                out.style.display   = 'block';
                div.style.height    = '110px';
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
    let src = await readFile('/apps/news/news.txt');
    let url = src.split('\n').filter(x => x != '');
    let dwn = url.map(async x => await readFile(x).then(k => rssParser(k)));
    let xml = await Promise.all(dwn);
    let tmp = [].concat.apply([], xml);

    tmp.sort((a,b,) => Date.parse(b[1]) - Date.parse(a[1]));

    let arr = tmp.map(x => [ x[0]
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
    let tbl = arrayToTable(arr, false, true)

    tbl.setAttribute('id', 'NewsTable_' + );

    return tbl;
}
