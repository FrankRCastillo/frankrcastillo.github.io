// Show help screen

export async function help() {
    let tbl = await getCmdInfo();

    print(tbl);
}

