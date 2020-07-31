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
    var isoCty = iso.map(m => m[0]);

    return arr.map((x, i, r) => {
        return (( i + 1 < r.length 
               && isoCty.includes(r[i][0])
               && isoCty.includes(r[i + 1][0])
               )? r[i] : [].concat(r[i], r[i + 1]))
    })
    .filter(x => isoCty.includes(x[0]))
    .map(x => {
        return x.filter(p => ![ null
                              , undefined
                              , '- NDE'
                              , 'Last Updated:'
                              ].includes(p))
                .map(p => p.trim())
                .map((p, j, q) => {
                    if (j + 1 < q.length) {
                        var rtn = '';
                        if(q[j + 1][0] == ','){
                            rtn = q[j] + q[j + 1];
                            q[j + 1] = null;
                        } else {
                            rtn = q[j];
                        }
                        return rtn;
                    }
                })
                .filter(p => p != null)
                .map((p, j, q) => {
                    if (j > 0 && j + 1 < q.length){
                        var rtn = null;

                        if (q[j + 1].match(/.*[A-Z]{2,}.*/)
                        && !q[j + 1].match(/ US/)
                        && !q[j + 1].match(/ UN/)
                        && j % 2 != 0){
                            rtn = q[j];
                        } else {
                            rtn = q[j] + q[j + 1];
                            q[j + 1] = null;
                        }

                        return rtn;
                    }
                })
                .map((p, j, q) => {
                    var rtn = j % 2 == 0 ? [q[0][0], q[0][1], q[j], q[j + 1]] : null
                    q[0] = null;
                    return rtn;
                })
                .filter(p => p != null)
    })
    .filter(x => x != null)
}

