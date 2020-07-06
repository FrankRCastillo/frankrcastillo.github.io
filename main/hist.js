// |govt|hist|World history infographic (powered by CIA World Factbook)

export async function hist() {
    var url = 'https://www.cia.gov/library/publications/resources/the-world-factbook/fields/325.html'
    var txt = await ReadFile(url);
    var doc = document.implementation.createDocumentType( 'html', '', '');
    var dom = document.implementation.createDocument('', 'html', doc);

    dom.documentElement.outerHTML = txt;

    var lst = dom.getElementById('fieldListing');
    var tag = lst.getElementsByTagName('tr');
    var arr = [];

    for (var cty in tag) {
        var name = cty.getElementsByClassName('country')[0].innerText;
        var hist = cty.getElementById('field-background').innerText;

        arr.push([cty.id, name, hist]);
    }
}
