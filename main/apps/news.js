export async function news() {
    print('Loading...');

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

    arr.sort((a, b) => dateUtc(b[2]) - dateUtc(a[2]));

    var tbl = ArrayToTable(arr, false, true);
    var out = document.getElementById('outtext');
    out.innerText = '';
    out.appendChild(tbl);    

    console.log("news");
}

function dateUtc(str) {
    var reldtg = Date.parse(str);
    var utcdtg = new Date(reldtg);

    return utcdtg.toUTCString();
}
