export async function apps() {
    var gitapi = 'https://api.github.com/repos/FrankRCastillo/frankrcastillo.github.io/git/trees/master?recursive=1';
    var gitjsn = await ReadFile(gitapi);
    
    clear();
    print(gitjsn);
    cmdReady();
}
