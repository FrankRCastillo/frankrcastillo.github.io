// | blog : Show the personal blog of Frank R. Castillo

export async function blog() {
    var url  = 'https://frankrcastillo.github.io/';
    var list = await FileList(/main\/blog\/.*/);

    clear();
    print('blog in progres...');
    cmdReady();
}
