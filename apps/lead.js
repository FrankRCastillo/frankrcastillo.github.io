// |wrld|lead|National leaders and tenures (source: CIA WFB)

export async function lead() {
    var out = document.getElementById('outtext');
    var iso = TableToArray(await ReadFile('/js/iso.tsv'), '\t');
    var arr = await FileList(/apps\/lead\/2018.*\.pdf/);

    arr.sort((a, b) => b - a)

    var prs = arr.map(async x => {
        var file = x.split('\/');
        var base = file[file.length - 1].split('.');
        var text = await readPdf(x);
        return parsePages(text, iso, base[0], base[1]);
    });
    
    console.log("pause");
}

function pageToArray(arr){
    var sel = document.createElement('select');
    var tbl = document.createElement('table');



    return tbl;
}

async function readPdf(url){
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
    return iso.includes(str);
}

function roleTest(str){
    return / US/.test(str)
       ||  / UN/.test(str)
       ||  /CEO/.test(str)
       ||  /[A-Z]{1}[a-z]{2,}/.test(str);
}

function parsePages(arr, iso, year, month) {
    var isoCty = iso.map(m => m[0]);

    var consol = arr.map((x, i, r) => {
        return (( i + 1 < r.length                  
               && isoCty.includes(r[i][0])          
               && isoCty.includes(r[i + 1][0])      
               )? r[i] : [].concat(r[i], r[i + 1])) 
    });

    var ctyArr = consol.filter(x => isoCty.includes(x[0]));
    var getArr = ctyArr.map(x => {
        var rtnArr = [['','','','','']];
        var c = '';
        var r = '';
        var n = ''; 
        var t = x.filter(p => ![ null             
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

        for (var i = 0; i < t.length; i++) {
            if (t[i] != null) {
                switch (true) {
                    case ctryTest(t[i], isoCty):
                        c = t[i];
                        break;
 
                    case nameTest(t[i]):
                        n = t[i];
                        break;
 
                    case !nameTest(t[i])
                      &&  roleTest(t[i]):
                        r = t[i];
                        break;
 
                    case  roleTest(t[i])
                      &&  roleTest(rtnArr[rtnArr.length - 1][2]):
                        rtnArr[rtnArr.length - 1][2] += ' ' + t[i];
                        break;
 
                    //default:
                    //    rtn.push('[ O ]\t' + c[i]);
                }
            }
 
            if (c != '' && r != '' && n != '') {
                rtnArr.push([year, month, c, r, n]);
                r = '';
                n = '';
            }
        }
        rtnArr.shift();

        return rtnArr;
    })

    return getArr;
}

