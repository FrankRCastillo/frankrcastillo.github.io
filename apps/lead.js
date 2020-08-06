// |wrld|lead|National leaders and tenures (source: CIA WFB)

export async function lead() {
    var out = document.getElementById('outtext');
    var tsv = await ReadFile('/js/iso.tsv');
    var iso = TableToArray(tsv, '\t');
    var arr = await FileList(/apps\/lead\/2018.*\.pdf/);
    var dic = {};

    arr.sort((a, b) => b - a)

    out.appendChild(createLeadGantt(arr));

    for (var i = 0; i < arr.length; i++) {
        var fileArr = arr[i].split('\/');
        var baseFle = fileArr[fileArr.length - 1];
        var fileDte = baseFle.replace(/\D/g, '');
        var bnryPdf = await ReadFile(arr[i]);
        var readFle = await readPdf(bnryPdf);
        var prsdFle = parsePages(readFle, iso, fileDte);

        for (var j = 0; j < prsdFle.length; j++) {
            for (var k = 0; k < prsdFle[j].length; k++) {
                var key = { prsdFle[j][k][1] : { prsdFle[j][k][2] : { prsdFle[j][k][3] } } };

                if (key in dic) {
                    dic[key] = [ dic[key][1], prsdFle[j][k][0] ];
                } else {
                    dic[key] = [ prsdFle[j][k][0], '' ];
                }
            }
        }
    }

    console.log("pause");
}

function createLeadGantt(arr) {
    var tbl = document.createElement('table');
    var ytr = document.createElement('tr');
    var mtr = document.createElement('tr');
    var ylb = document.createElement('td');
    var mlb = document.createElement('td');
    var sel = document.createElement('select');
    var div = document.createElement('div');
    tbl.setAttribute('id', 'GanttTable');
    ytr.setAttribute('id', 'YearRow');
    mtr.setAttribute('id', 'MonthRow');
    ytr.appendChild(ylb);
    mtr.appendChild(mlb);
    tbl.appendChild(ytr);
    tbl.appendChild(mtr);
    div.appendChild(sel);
    div.appendChild(tbl);

    return div;
}

function addToLeadGantt(arr) {
    var table = document.getElementById('GanttTable');
    var years = document.getElementById('YearRow');
    var month = document.getElementById('MonthRow');

    // countries
    for (var i = 0; i < arr[i].length; i++) {

        // position
        for (var j = 0; j < arr[i][j].length; j++) {
            var date    = arr[i][j][0];
            var country = arr[i][j][1];
            var role    = arr[i][j][2];
            var person  = arr[i][j][3];
            var roleTd  = table.querySelector('[country="' + country + '"][role="' + role + '"]');
            var prsnTd  = roleTd.getElementsByTagName('td');

            if (roleTd == null) {
                roleTd = document.createElement('tr');
                roleTd.setAttribute('country', country);
                roleTd.setAttribute('role', role);
                roleTd.textContent = person;
                table.appendChild(roleTd);
            }

            if (prsnTd == null) {
                prsnTd = document.createElement('td');
                prsnTd.setAttribute('dateStart', date)
                prsnTd.textContent = '';
            }
            
        }
    } 
}

async function readPdf(binary) {
    var bin = convertDataURIToBinary(binary);
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

function nameTest(str) {
    return /[A-Z]{2,}/.test(str)
       &&  /[A-Z]{1}[a-z]{2,}/.test(str)
       && !/ US/.test(str)
       && !/ UN/.test(str)
       && !/CEO/.test(str);
}

function dateTest(str) {
    return /(|[0-3][0-9]) [A-Za-z]{3} [0-9]{4}/.test(str);
}

function ctryTest(str, iso) {
    return iso.includes(str);
}

function roleTest(str) {
    return / US/.test(str)
       ||  / UN/.test(str)
       ||  /CEO/.test(str)
       ||  /[A-Z]{1}[a-z]{2,}/.test(str);
}

function parsePages(arr, iso, date) {
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
                       && q[j + 1][0] == ',') {
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
                rtnArr.push([date, c, r, n]);
                r = '';
                n = '';
            }
        }
        rtnArr.shift();

        return rtnArr;
    })

    return getArr;
}

