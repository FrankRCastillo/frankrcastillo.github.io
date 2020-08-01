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
    return / US/.test(c[i])
       ||  / UN/.test(c[i])
       ||  /CEO/.test(c[i])
       ||  /[A-Z]{1}[a-z]{2,}/.test(c[i]);
}

function parsePages(arr, iso) {
    var isoCty = iso.map(m => m[0]);

    return arr.map((x, i, r) => {
        return (( i + 1 < r.length                  
               && iso.map(m => m[0]).includes(r[i][0])          
               && iso.map(m => m[0]).includes(r[i + 1][0])      
               )? r[i] : [].concat(r[i], r[i + 1])) 
    })                                              
    .filter(x => iso.map(m => m[0]).includes(x[0]))             
    .map(x => {
        var rtn = [];

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

        for (var i = 0; i < c.length; i++) {
            var rtnEnd = rtn[rtn.length - 1];

            if (c[i] != null) {
                switch (true) {
                    // country: country name listed in the ISO array.
                    case ctryTest(c[i], iso):
                        rtn.push('[ C ]\t' + c[i]);
                        break;

                    // date: REGEX check for string in date form
                    case dateTest(c[i]):
                        rtn.push('[ D ]\t' + c[i]);
                        break;

                    // name: one word with two or more upper case characters, one word with one upper case character and two or more lower case, doesn't have the words " US", " UN", or "CEO".
                    case nameTest(c[i]):
                        rtn.push('[ N ]\t' + c[i]);
                        break;
                    
                    // role: previous element in returning array pass the name or date tests, and current element passes the role test.
                    case ( nameTest(rtn[rtn.length - 1]) 
                        || dateTest(rtn[rtn.length - 1]))
                        && roleTest(c[i]):
                        rtn.push('[ R ]\t' + c[i]);
                        break;

                    // role with new line break: both the previous element and the current one pass the role test, as well as the previous string not being a  date, in which case the current string is appended to the previous element.
                    case  roleTest(c[i])
                      &&  roleTest(rtn[rtn.length - 1])
                      && !dateTest(rtn[rtn.length - 1]):
                        rtn[rtn.length - 1] += '_' + c[i];
                        break;

                    // other elements that did not pass any of the previous tests.
                    default:
                        rtn.push('[ O ]\t' + c[i]);
                }
            }
        }

        return rtn;
    })
    .filter(p => p != null)
    .map((p, j, q) => j % 2 == 0 ? [q[j], q[j + 1]] : null)
    .filter(p => p != null)
}

