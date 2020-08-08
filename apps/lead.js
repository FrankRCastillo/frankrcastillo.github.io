// |wrld|lead|National leaders and tenures (source: rulers.org)

export async function lead() {
    var url = 'http://rulers.org/';
    var txt = await readFile(url);
    var dom = new DOMParser().parseFromString(txt, 'text/html')
                             .getElementsByTagName('a'); 
    var arr = Array.from(dom)
                   .map(x => x.href.replace(x.baseURI, url))
                   .filter(x => x.match(url + 'rul.*\.html'));

    arr.forEach(async x => {
        var get = await readFile(x);
        console.log(get);
    });
}

