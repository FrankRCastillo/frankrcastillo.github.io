// |apps|blog|Personal blog

export function blog() {
    let list = window.fileList.filter(/apps\/blog\/.*/);

    print(list);
}
