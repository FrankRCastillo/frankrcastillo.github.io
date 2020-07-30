// |wrld|lead|Government leaders (national, provincial, local; source: CIA WFB)

export async function lead() {
    var iso = TableToArray(await ReadFile('/js/iso.tsv'), '\t');                            // read csv file with iso2 to iso3 table and convert to array
    var arr = await FileList(/apps\/lead\/2015\.05\.pdf/)
    var out = arr.map(async function(x) {
        var path = x.split('/')
        var date = path[2].split('.');
        var file = await readPdf(x);
        var prsd = parsePages(file, iso);

        return [date[0], date[1], prsd];
    });

    print("Under construction");
}

async function readPdf(url) {
    var arr = [];
    var get = await ReadFile(url);
    var bin = convertDataURIToBinary(get);
    var wht = { normalizeWhitespace : true };
    var doc = await pdfjsLib.getDocument(bin).promise;
    var txt = Array.from({length : doc.numPages}, async (x, i) => {
        return (await (await doc.getPage(i + 1))
                                .getTextContent())
                                .items
                                .map(token =>  token.str)
    });

    return (await Promise.all(txt));
}

function parsePages(arr, iso) {
    var abbrevArr = arr.filter((x, i) => x[0] == 'Key To Abbreviations' && i > 0)
                       .map(function(x, i, orig){
                           if(i % 2 == 0){
                               return [ orig[i - 1], orig[i] ];
                           }
                       }).filter(x => x != null || x != undefined);
    

    var ctryMatch = arr.map(function(x, i, orig){
        if(iso.map(r => r[0]).includes(x[0])){
            if(i + 1 < orig.length - 1){
                var appendEntry = null;

                if(iso.map(r => r[0]).includes(orig[i + 1][0])){
                    appendEntry = x;
                } else {
                    appendEntry = [].concat(x, orig[i + 1]);
                }

                var mergeHonors = appendEntry.map(function(word, idx, entry){
                    if(idx + 1 < entry.length) {
                        if(entry[idx + 1].charAt(0) == ','){
                            entry[idx] = entry[idx] + entry[idx + 1];
                            entry[idx + 1] = null;
                        }
                    }
                    return entry[idx] == null ? entry[idx] : entry[idx].trim();
                });

                var finalEntry = mergeHonors.filter(x => x != null);

                return finalEntry;
            }
        }
    });
    
    return ctryMatch.filter(x => x != undefined);
}

