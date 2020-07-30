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
    return arr.map((x, i, orig) => {                                                    // iterate through array containing page (one row = one page)
        if(iso.map(r => r[0]).includes(x[0])){                                          // check that all countries are listed in the ISO array
            if(i + 1 < orig.length - 1){                                                // ensure that no out of bounds exceptions occur
                var ctryRow = iso.map(r => r[0]).includes(orig[i + 1][0])               // check that each row corresponds to a country...
                return (iso.map(ctryRow ? x : [].concat(x, orig[i + 1])))               // ...and if true, return row; otherwise, return row-n + row-n+1
                .map((word, j, entry) => {                                              // iterate country rows. each element is a role, name, or honorific
                    if(j + 1 < entry.length) {                                          // another out of bounds check
                        if(entry[j + 1].charAt(0) == ','){                              // if an element in the row starts with a comma, it is an honorific...
                            entry[j] = entry[j] + entry[j + 1];                         // ...which should be appended to the name prior to it...
                            entry[j + 1] = null;                                        // ...and that value should be nulled out for later removal
                        }
                    }
                    return (entry[j] == null ? null : entry[j].trim());
                })                 // these nulls are moved here, while other strings are trimmed
                .filter(x => x != null
                          && x != undefined
                          && x != '- NDE'
                          && x != 'Last Updated:')
                .map((x, i, orig) => ( i % 2 == 0 ? [ orig[i - 1], orig[i] ] : null))
                .filter(x => x != null)
            }
        }
    }).filter(x => x != undefined);
}

