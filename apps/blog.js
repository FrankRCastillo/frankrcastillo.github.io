// |apps|blog|Personal blog of Frank R. Castillo

export async function blog(consoleName) {
    let url  = 'https://frankrcastillo.github.io/';
    let list = await fileList(/apps\/blog\/.*/);

    clear(consoleName);
    print('blog in progres...', consoleName);
}
