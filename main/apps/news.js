export async function news() {
    var src = await ReadFile('../main/apps/news.txt');
    var url = src.split('\n');
    var arr = [];

    for (var i = 0; i < url.length; i++) {
        var xml = await ReadFile(url[i]);
        var tmp = RSSParser(xml);

        for (var j = 0; j < tmp.length; j ++) {
            arr.push(tmp[j]);
        }
    }

    var tbl = ArrayToTable(arr, false, true);
    var out = document.getElementById('outtext');
    out.innerText = '';
    out.appendChild(tbl);    

    console.log("news");
}
