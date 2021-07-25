// |apps|blog|Personal blog

export function blog() {
    let list = window.filelist.filter((x) => x.match('apps/blog/'));

    print(list);
}
