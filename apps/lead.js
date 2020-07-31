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
    return arr.filter(x => iso.map(m => m[0]).includes(x[0]))
              .map((x, i, r) => {
                  if(i + 1 < r.length - 1){
                      var row = iso.map(m => m[0]).includes(r[i + 1][0])
                      return (row ? x : [].concat(x, r[i + 1])).map((p, j, q) => {
                              if(j + 1 < q.length - 1){
                                  if(q[j + 1].charAt(0) == ','){
                                      q[j] += q[j + 1];
                                      q[j + 1] = null;
                                  }
                              }
                              return (q[j] == null ? null : q[j].trim());
                          })
                          .filter(p => p != null
                                    && p != undefined
                                    && p != '- NDE'
                                    && p != 'Last Updated:')
                          .map((p, j, q) => (j + 1 < q.length && j % 2 != 0 ? [ q[j], q[j + 1] ] : null))
                          .filter(x => x != null);
                      }
                  })
}

