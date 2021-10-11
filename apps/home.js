// Show the home screen

export async function home(){
    let str = await read('/apps/home/home.txt');

    print(str)
}
