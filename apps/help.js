// Show help screen

export async function help() {
    let lst = await getCmdInfo();
    let tbl = arrayToTable(lst);

    print(tbl);
}

