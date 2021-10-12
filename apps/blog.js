// Personal blog

export function blog() {
    let path = 'apps/blog/';
    let list = window.filelist.filter((x) => x.match(path));
    let urls = list.map((x) => {
        let lnk = document.createElement('a');

        lnk.text = x.replace(path, '');
        lnk.setAttribute('href', '');
        lnk.addEventListener('click',
            (e) => {
                console.log(e.target.text);
        //         let url = e.text;
        //         let txt = await read(url);
        //         print(txt);
            }
        );


        return lnk;
    });

    print(urls);
}
