export async function blog() {
    var url  = 'https://frankrcastillo.github.io/';
    var list = await FileList(/main\/blog\/.*/);

    clear();
    print('blog in progres...');
    cmdReady();
}
