// |govt|hist|World history infographic (powered by CIA World Factbook)

export async function hist() {
    var url = 'https://www.cia.gov/library/publications/resources/the-world-factbook/fields/325.html'
    var txt = await ReadFile(url);
    var doc = new DOMParser().parseFromString(txt, 'text/html');
    var lst = doc.getElementById('fieldListing');
    var bdy = lst.getElementsByTagName('tbody');
    var tag = bdy[0].getElementsByTagName('tr');
    var arr = [];

    for (var i = 0; i < tag.length; i++) {
        var id   = tag[i].id;
        var name = tag[i].getElementsByClassName('country')[0].innerText;
        var hist = tag[i].querySelector('#field-background').innerText;

        arr.push([id, name, hist]);
    }

    console.log('pause');
}
