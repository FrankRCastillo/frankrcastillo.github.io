// |wrld|lead|National leaders and tenures (source: rulers.org)

export async function lead() {
    var url = 'http://rulers.org/';
    var arr = Array.from(getPageElem(url, 'a'))
                   .map(x => x.href.replace(x.baseURI, url))
                   .filter(x => x.match(url + 'rul.*\.html'));

    arr.forEach(async x => {
        var get = getPageElem(x, 'body');

        get.outerHTML = get.outerHTML.replace('<a href=\"', '\(delimit\)$&');

        console.log(get.innerText);
    });
}

async function getPageElem(url, elem) {
    return readFile(url).then(x => {
        return new DOMParser().parseFromString(x, 'text/html')
                              .getElementsByTagName(elem);
    })
}

