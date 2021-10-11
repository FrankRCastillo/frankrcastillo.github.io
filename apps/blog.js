// Personal blog

export function blog() {
    let list = window.filelist.filter((x) => x.match('apps/blog/'));
    let urls = list.map((x) => {
        let lnk = document.createElement('a');

        lnk.setAttribute('onClick', 'print(await read(' + x + '))');
        lnk.text = x;

        return lnk;
    });

    print(urls);
}
