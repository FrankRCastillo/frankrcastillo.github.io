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
    var pdf = tmp.map(function(x){
        var s = x.split('/');
        return [ s[7], s[8].split(s[7])[0], x]
    });

    clear();
    print(pdf);
}

