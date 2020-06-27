// | news   Show RSS feed from various news sources

export async function news() {
    var src = await ReadFile('../main/apps/news.txt');
    var url = src.split('\n');
    var arr = [];

    for (var i = 0; i < url.length; i++) {
        try {
            var xml = await ReadFile('https://cors-anywhere.herokuapp.com/' + url[i]);
            var tmp = RSSParser(xml);

            for (var j = 0; j < tmp.length; j ++) {
                arr.push(tmp[j]);
            }
        } catch {
            console.log(url[i] + ' not available');
        }
    }

    arr.sort((a, b) => Date.parse(b[2]) - Date.parse(a[2]));

    var tbl = ArrayToTable(arr, false, true);
    clear();
    document.getElementById('outtext').appendChild(tbl);    
    cmdReady();
}
