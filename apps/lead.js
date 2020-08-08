// |wrld|lead|National leaders and tenures (source: rulers.org)

export async function lead() {
    var url = 'http://rulers.org/index.html';
    var get = await readFile(url);
    var dom = new DOMParser().parseFromString(get, 'text/html')
                             .getElementsByTagName('a'); 
    var arr = Array.from(dom)
                   .map(x => dom.baseURI + x.href)
                   .filter(x => x.match('rul.*\.html'));

    console.log('pause');
}

