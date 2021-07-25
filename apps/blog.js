// |apps|blog|Personal blog

export async function blog() {
    let list = await fileList(/apps\/blog\/.*/);

    print(list);
}
