// |wrld|lead|Listing of government leaders (national, provincial, local; source: CIA WFB)

export async function lead() {
    var url = "https://www.cia.gov/library/publications/world-leaders-1/";
    var txt = await ReadFile(url);
    var doc = new DOMParser().parseFromString(txt, 'text/html');
    var lnk = doc.getElementsByTagName('a');
    var pdf = Array.from(lnk).map(x => x.href);

    clear();
    document.getElementById('outtext').appendChild(ArrayToTable(pdf));
}
