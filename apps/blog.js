// Personal blog

export function blog() {
    let path = 'apps/blog/';
    let list = window.filelist.filter((x) => x.match(path));
    let urls = list.map((x) => {
        let lnk = document.createElement('a');

        lnk.addEventListener('click',
            function(e) {
                let url = e.currentTarget.text;
                let txt = await read(url);
                print(txt);
        });

        lnk.text = x.replace(path, '');

        return lnk;
    });

    print(urls);
}
