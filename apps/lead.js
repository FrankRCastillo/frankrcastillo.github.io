// |wrld|lead|National leaders and tenures (source: rulers.org)

export async function lead() {
    var url = 'http://rulers.org/';
    var arr = Array.from(await getPageElem(url, 'a'))
                   .map(x => x.href.replace(x.baseURI, url))
                   .filter(x => x.match(url + 'rul.*\.html'));

    arr.forEach(x => {
        var get = await getPageElem(x, 'body');

        get.outerHTML = get.outerHTML.replace('<a href=\"', '\(delimit\)$&');

        console.log(get.innerText);
    });
}

async function getPageElem(url, elem) {
    return await readFile(url).then(x => {
        return new DOMParser().parseFromString(x, 'text/html')
                              .getElementsByTagName(elem);
    })
}

