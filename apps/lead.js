// |wrld|lead|Listing of government leaders (national, provincial, local; source: CIA WFB)

export async function lead() {
    var arr = await FileList(/apps\/lead\/.*\.pdf/)
    var out = arr.map(async function(x) {
        var path = x.split('/')
        var date = path[2].split('.');
        var file = await readPdf(x);

        return [date[0], date[1], file];
    });

    print("Under construction");
}

async function readPdf(url) {
    var str = '';
    var get = await ReadFile(url);
    var bin = convertDataURIToBinary(get);
    pdfjsLib.getDocument(bin)
            .promise
            .then(function(pdf) {
        for (var i = 1; i <= pdf.numPages; i++) {
            pdf.getPage(i)
               .then(page => page.getTextContent({ normalizeWhitespace : true })
               .then(content => content.items.forEach(item => str += item.str)));
        }
    });

    return str;
}

