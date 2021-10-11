// Personal blog

export function blog() {
    let list = window.filelist.filter((x) => x.match('apps/blog/'));
    let urls = list.forEach((x) => {
        let url = 'https://frankrcastillo.github.io/' + x;
        let lnk = document.createElement('a');

        lnk.setAttribute('href', url);
        lnk.text = x;

        return lnk.getAttribute('outerHTML');
    });

    print(urls);
}
