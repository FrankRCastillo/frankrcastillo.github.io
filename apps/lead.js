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
                                //.join('\n');
    });

    return (await Promise.all(txt)); //.join('\n');
}

function parsePages(arr, iso) {
    var ctryMatch = arr.map(function(x){
        if(iso.map(r => r[0]).includes(x[0])){
            console.log("pause");
        }
    });

    return ctryMatch;
}

