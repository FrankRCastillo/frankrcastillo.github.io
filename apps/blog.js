// Personal blog

async export function blog() {
    let path = 'apps/blog/';
    let list = window.filelist.filter((x) => x.match(path));
    let urls = list.map((x) => {
        let lnk  = document.createElement('a');
        let file = x.replace(path, '');
        lnk.text = file;
        lnk.setAttribute('href', 'javascript:void(0)');
        lnk.addEventListener('click', async (e) => {
            let txt = await read(x);
            print(txt);
        });

        return lnk;
    });

    print(urls);
}
