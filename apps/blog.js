// |apps|blog|Personal blog of Frank R. Castillo

export async function blog() {
    let list = await fileList(/apps\/blog\/.*/);

    print(list);
}
