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

function nameTest(str){
    return /[A-Z]{2,}/.test(str)
       &&  /[A-Z]{1}[a-z]{2,}/.test(str)
       && !/ US/.test(str)
       && !/ UN/.test(str)
       && !/CEO/.test(str);
}

function dateTest(str){
    return /(|[0-3][0-9]) [A-Za-z]{3} [0-9]{4}/.test(str);
}

function ctryTest(str, iso){
    return iso.map(m => m[0]).includes(str);
}

function roleTest(str){
    return / US/.test(str)
       ||  / UN/.test(str)
       ||  /CEO/.test(str)
       ||  /[A-Z]{1}[a-z]{2,}/.test(str);
}

function parsePages(arr, iso) {
    var isoCty = iso.map(m => m[0]);
    var rtnArr = [];

    return arr.map((x, i, r) => {
        return (( i + 1 < r.length                  
               && isoCty.includes(r[i][0])          
               && isoCty.includes(r[i + 1][0])      
               )? r[i] : [].concat(r[i], r[i + 1])) 
    })                                              
    .filter(x => isoCty.includes(x[0]))             
    .map(x => {
        var c = x.filter(p => ![ null             
                               , undefined
                               , '- NDE'
                               , 'Last Updated:'     
                               ].includes(p))
                 .map(p => p.trim())
                 .map((p, j, q) => {        
                     var rtn = '';             

                     if ( j + 1 < q.length     
                       && q[j + 1][0] == ','){
                          rtn = q[j] + q[j + 1];
                          q[j + 1] = null;      
                     } else {
                          rtn = q[j]
                     }
                     return rtn;
                 })
                 .filter(x => x != null)

        var c = '';
        var d = '';
        var r = '';
        var n = '';

        for (var i = 0; i < c.length; i++) {
            if (c[i] != null) {
                switch (true) {
                    case ctryTest(c[i], iso):
                        c = c[i];
                        break;

                    case dateTest(c[i]):
                        d = c[i];
                        break;

                    case nameTest(c[i]):
                        n = c[i];
                        break;

                    case (nameTest(rtnArr[rtnArr.length - 1][3]) 
                       || dateTest(rtnArr[rtnArr.length - 1][1]))
                       && roleTest(c[i]):
                        r = c[i];
                        break;

                    case  roleTest(c[i])
                      &&  roleTest(rtnArr[rtnArr.length - 1][2])
                      && !dateTest(rtnArr[rtnArr.length - 1][1]):
                        rtnArr[rtnArr.length - 1][2] += ' ' + c[i];
                        break;

                    //default:
                    //    rtn.push('[ O ]\t' + c[i]);
                }
            }

            if (c != '' && d != '' && r != '' && n != '') {
                rtnArr.push([c, d, r, n]);
                r = '';
                n = '';
            }
        }

        return rtn;
    })
}

