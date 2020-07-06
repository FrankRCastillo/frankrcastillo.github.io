// |hist|World history infographic (powered by CIA World Factbook)

export async hist() {
    var url = 'https://www.cia.gov/library/publications/resources/the-world-factbook/fields/325.html'
    var txt = await ReadFile(url);
    var doc = document.implementation.createHTMLDocument('New Document');
    p.outerHTML = txt;

        
}
