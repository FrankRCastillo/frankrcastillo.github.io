// |apps|blog|Personal blog

export async function blog() {
    let list = window.fileList.filter(/apps\/blog\/.*/);

    await print(list);
}
