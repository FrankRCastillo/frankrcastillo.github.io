// |apps|blog|Personal blog

export function blog() {
    let list = window.filelist.filter(/apps\/blog\/.*/);

    print(list);
}
