// Personal blog

export async function blog() {
    let path = 'apps/blog/';
    let list = window.filelist.filter((x) => x.match(path));
    let urls = list.map((x) => {
        let lnk  = document.createElement('a');
        let file = x.replace(path, '');

        lnk.addEventListener('click', async (e) => {
            let txt = await read(e.currentTarget.url);

            print(txt);
        });

        lnk.text = file;
        lnk.url  = x;

        return lnk;
    });

    print(urls);
}
