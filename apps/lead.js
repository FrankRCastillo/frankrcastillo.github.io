// |wrld|lead|National leaders and tenures (source: CIA WFB)

export async function lead() {
    var out = document.getElementById('outtext');
    var iso = TableToArray(await ReadFile('/js/iso.tsv'), '\t');
    var arr = await FileList(/apps\/lead\/2019.*\.pdf/);
    var prs = [];

    for (var i = 0; i < arr.length; i++) {
        var fle = arr[i].split('\/');
        var bse = fle[fle.length - 1].split('.');
        var txt = await readPdf(arr[i]);
        var tmp = [ bse[0], bse[1], parsePages(txt, iso) ];

        prs = [].concat(tmp, prs);
    };

    out.appendChild(leadGantt(prs));
}

function leadGantt(arr){
    var tbl = document.createElement('table');
    var ytr = document.createElement('tr');
    var mtr = document.createElement('tr');
    var sel = document.createElement('select');
    var mth = 'JFMAMJJASOND';

    for (var i = 0; i < arr.length; i++) {
        if (i % 12 == 0){
            var ytd = document.createElement('td');
            ytd.textContent = arr[i][0];
            ytd.setAttribute('colspan', 12);
            ytr.appendChild(ytd);
        }

        var mtd = document.createElement('td');
        mtd.textContent = mth[i % 12];
        mtr.appendChild(mtd);
    }

    tbl.appendChild(ytr);
    tbl.appendChild(mtr);

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

function parsePages(arr, iso) {
    var isoCty = iso.map(m => m[0]);

    var consol = arr.map((x, i, r) => {
        return (( i + 1 < r.length                  
               && isoCty.includes(r[i][0])          
               && isoCty.includes(r[i + 1][0])      
               )? r[i] : [].concat(r[i], r[i + 1])) 
    });

    var ctyArr = consol.filter(x => isoCty.includes(x[0]));
    var getArr = ctyArr.map(x => {
        var rtnArr = [['','','']];
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
                rtnArr.push([c, r, n]);
                r = '';
                n = '';
            }
        }
        rtnArr.shift();

        return rtnArr;
    })

    return getArr;
}

