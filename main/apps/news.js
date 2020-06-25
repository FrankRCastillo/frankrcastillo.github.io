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

    var nws = Sort2DArray(arr, 2);
    var tbl = ArrayToTable(nws, false, true);
    var out = document.getElementById('outtext');
    out.innerText = '';
    out.appendChild(tbl);    

    console.log("news");
}
