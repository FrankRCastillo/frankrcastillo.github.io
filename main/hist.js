// |govt|hist|World history infographic (powered by CIA World Factbook)

export async function hist() {
    var url = 'https://www.cia.gov/library/publications/resources/the-world-factbook/fields/325.html'
    var txt = await ReadFile(url);
    var doc = new DOMParser().parseFromString(txt, 'text/html');
    var lst = doc.getElementById('fieldListing');
    var bdy = lst.getElementsByTagName('tbody');
    var tag = bdy[0].getElementsByTagName('tr');
    var arr = [];

    for (var i = 0; i < tag.length; i++) {
        var id   = tag[i].id;
        var name = tag[i].getElementsByClassName('country')[0].innerText.trim();
        var hist = tag[i].querySelector('#field-background').innerText.trim();
        var harr = parseHistory(hist);
        arr.push([id, name, harr]);
    }

    console.log('pause');
}

function parseHistory(str) {
    var rgxexp = [ "/([A-Za-z](\.)){2,} [A-Z]/"                                         // acronyms at the end of a sentence; delete all but last period
                 , "/([A-Za-z](\.)){2,} [^A-Z]/"                                        // acronyms within a sentece, but not the end; delete all periods
                 , "/[A-Z]{1}[a-z]{1,3}(\.) (?!King)([A-Z]{1}[a-z]{1,} ){0,}[A-Z]{2,}/" // ranks and titles; excludes the title of King
                 ]
    
    var tmp = str;

    for (var i = 0; i < rgxexp.length; i++) {
        var rgxdom = new RegExp(rgxexp[i]);
        var rgxget = tmp.match(rgxdom);
        
        if (rgxget != null) {
            for (var j = 0; j < rgxget.length; j++) {
                var rgxmod = '';

                if (i == 0) {
                    rgxmod = rgxget[j].replace(/[.](?=.*[.])/g, '');

                } else {
                    rgxmod = rgxget[j].replace('.', '');
                }

                tmp = tmp.replace(rgxget[j], rgxmod);
            }
        }
    }

    return tmp.split('. ');
}
