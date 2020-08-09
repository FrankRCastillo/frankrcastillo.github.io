// |wrld|lead|National leaders and tenures (source: rulers.org)

export async function lead() {
    var url = 'http://rulers.org/';
    var arr = Array.from(await getPageElem(url, 'a'))
                   .map(x => x.href.replace(x.baseURI, url))
                   .filter(x => x.match(url + 'rul.*\.html'));

    arr.forEach(async x => {
        var get = await getPageElem(x, 'body').then(k => {
            k[0].outerHTML = k[0].outerHTML
                                 .replace( /<a name=\"\w+\"><hr><h2>\w+<\/h2>/g
                                         , '\[delimit\]$&'
                                         );
            return k[0].innerText;
        }).then(x => console.log(x));
    });
}

async function getPageElem(url, elem) {
    return await readFile(url).then(x => {
        return new DOMParser().parseFromString(x, 'text/html')
                              .getElementsByTagName(elem);
    })
}

