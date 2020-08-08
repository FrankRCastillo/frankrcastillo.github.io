// |wrld|lead|National leaders and tenures (source: rulers.org)

export async function lead() {
    var url = 'http://rulers.org/';
    var arr = Array.from(await getPageElem(url, 'a'))
                   .map(x => x.href.replace(x.baseURI, url))
                   .filter(x => x.match(url + 'rul.*\.html'));

    arr.forEach(async x => {
        var get = await getPageElem(x, 'body').then(k => {
            k.outerHTML = k.outerHTML.replace('<a href=\"', '\(delimit\)$&');
            return k.innerText;
        }).then(x => console.log(x));
    });
}

async function getPageElem(url, elem) {
    return await readFile(url).then(x => {
        return new DOMParser().parseFromString(x, 'text/html')
                              .getElementsByTagName(elem);
    })
}

