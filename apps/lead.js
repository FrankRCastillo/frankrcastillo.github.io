// |wrld|lead|National leaders and tenures (source: rulers.org)

window.rulers = [];

export async function lead() {
    let url = 'http://rulers.org/';
    let arr = Array.from(await getPageElem(url, 'a'))
                   .map(x => x.href.replace(x.baseURI, url))
                   .filter(x => x.match(url + 'rul.*\.html'));

    arr.forEach(async x => {
        let get = await getPageElem(x, 'body').then(k => {
            k[0].outerHTML = k[0].outerHTML
                                 .replace( /<a name=\"\w+\"><hr><h2>\w+<\/h2>/g
                                         , '\[delimit\]$&'
                                         );
            return k[0].outerHTML;
        }).then(x => {
            x.split('[delimit]')
             .filter(ele => !ele.match(/^Rulers.*/))
             .map(ele => saveRulers(ele));
        });
    });
}

function saveRulers(html) {
    let dom = new DOMParser().parseFromString(html, 'text/html');

    console.log('pause');
}

async function getPageElem(url, elem) {
    return await readFile(url).then(x => {
        return new DOMParser().parseFromString(x, 'text/html')
                              .getElementsByTagName(elem);
    })
}

