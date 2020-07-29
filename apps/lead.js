// |wrld|lead|Listing of government leaders (national, provincial, local; source: CIA WFB)

export async function lead() {
   var mth = [ 'January'
             , 'February'
             , 'March'
             , 'April'
             , 'May'
             , 'June'
             , 'July'
             , 'August'
             , 'September'
             , 'October'
             , 'November'
             , 'December'
             ];
    
    var url = "https://www.cia.gov/library/publications/world-leaders-1/";
    var txt = await ReadFile(url);
    var dom = new DOMParser().parseFromString(txt, 'text/html');
    var bse = dom.createElement('base');
    bse.setAttribute('href', url);
    dom.head.append(bse);
    var lnk = dom.getElementsByTagName('a');
    var tmp = Array.from(lnk)
                   .map(x => x.href)
                   .filter(x => x.match('.*ChiefsDirectory.pdf'));
    var arr = tmp.map(function(x){
        var s = x.split('/');
        var m = (mth.indexOf(s[8].split(s[7])[0]) + 1).toString();

        return [ s[7]
               , (m.length == 1 ? "0" + m : m)
               , x
               ]
    });

    var get = await ReadFile(arr[0][2]);
    var bin = convertDataURIToBinary(get);
    pdfjsLib.getDocument(bin).promise.then(function(pdf) {
        for (var i = 1; i <= pdf.numPages; i++) {
            pdf.getPage(i).then(function(page) {
                page.getTextContent({ normalizeWhitespace : true }).then(function(content){
                    content.items.forEach(function(item){
                        console.log(item.str);
                    });
                });
            });
        }
    });

    print("Under construction");
}

