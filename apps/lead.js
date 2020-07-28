// |wrld|lead|Listing of government leaders (national, provincial, local; source: CIA WFB)

export async function lead() {
    var url = "https://www.cia.gov/library/publications/world-leaders-1/";
    var txt = await ReadFile(url);
    var dom = new DOMParser().parseFromString(txt, 'text/html');
    var bse = dom.createElement('base');
    bse.setAttribute('href', url);
    dom.head.append(bse);
    var lnk = dom.getElementsByTagName('a');
    var pdf = Array.from(lnk).map(x => x.href).filter(x => x.endsWith('.pdf'));

    clear();
    document.getElementById('outtext').appendChild(ArrayToTable(pdf));
}
