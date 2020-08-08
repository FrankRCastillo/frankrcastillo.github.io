// |wrld|lead|National leaders and tenures (source: rulers.org)

export async function lead() {
    var url = 'http://rulers.org/';
    var get = await readFile(url);
    var dom = new DOMParser().parseFromString(get, 'text/html')
                             .getElementsByTagName('a'); 
    var arr = await Promise.all(
                  Array.from(dom)
                       .map(x => x.href.replace(x.baseURI, url))
                       .filter(x => x.match(url + 'rul.*\.html'))
                       .map(async x => await readFile(x))
            );

    console.log('pause');
}

