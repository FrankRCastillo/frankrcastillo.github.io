// Personal blog

export function blog() {
    let list = window.filelist.filter((x) => x.match('apps/blog/'));
    let urls = list.map((x) => {
        let url = 'https://frankrcastillo.github.io/' + x;
        let lnk = document.createElement('a');

        lnk.setAttribute('href', url);
        lnk.text = x;

        return lnk;
    });

    print(urls);
}
