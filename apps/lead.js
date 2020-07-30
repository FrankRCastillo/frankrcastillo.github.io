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
    var ctryMatch = arr.map((x, i, orig) => {
        if(iso.map(r => r[0]).includes(x[0])){
            if(i + 1 < orig.length - 1){
                // looks for whether the first element in the array is a country, as per the imported
                // ISO file. If not, that array "row" is appended to the end of the previous array,
                // resulting in each country to have its own row.
                var appendEntry = (iso.map(r => r[0]).includes(orig[i + 1][0]) ? x : [].concat(x, orig[i + 1]));

                // look for string element in the array that start with comma, append them to the
                // end of the previous string element, and set the original element to null for later
                // filtering. This allows the honorifics to be appended to the names of the respective
                // individuals.
                var mergeHonors = appendEntry.map((word, j, entry) => {
                    if(j + 1 < entry.length) {
                        if(entry[j + 1].charAt(0) == ','){
                            entry[j] = entry[j] + entry[j + 1];
                            entry[j + 1] = null;
                        }
                    }
                    return entry[j] == null ? null : entry[j].trim();})
                .filter(x => x != null
                          || x != '- NDE'
                          || x != 'Last Updated:')

                return mergeHonors;
            }
        }
    });
    
    return ctryMatch.filter(x => x != undefined);
}

