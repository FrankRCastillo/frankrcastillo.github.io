// |apps|blog|Personal blog of Frank R. Castillo

export async function blog() {
    let url  = 'https://frankrcastillo.github.io/';
    let list = await fileList(/apps\/blog\/.*/);

    clear();
    print('blog in progres...');
}
