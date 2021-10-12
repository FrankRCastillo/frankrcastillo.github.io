// Personal blog

export function blog() {
    let path = 'apps/blog/';
    let list = window.filelist.filter((x) => x.match(path));
    let urls = list.map((x) => {
        let lnk = document.createElement('a');

        lnk.text = x.replace(path, '');
        lnk.setAttribute('href', 'javascript:void(0)');
        lnk.addEventListener('click', (e) => {
            e = e || window.event;

            console.log(e.target.text);
           // let url = e.text;
           // let txt = await read(url);
           // print(txt);
        });


        return lnk;
    });

    print(urls);
}
