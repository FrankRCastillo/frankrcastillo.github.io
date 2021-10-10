// |apps|help|Show this help screen

export async function help() {
    let lst = await getCmdInfo();
    let hdr = ['Category', 'Command', 'Information'];
    let tbl = arrayToTable(lst, hdr);

    print(tbl);
}

