export const description = "Unmount current repo and return to default.";

export default function umount() {
    if ( window.repoName === window.defaultRepoName &&
         window.repoBase === window.defaultRepoBase ) {
        return 'already using default repo (cwd preserved)';
    }
    
    window.repoName  = window.defaultRepoName;
    window.repoBase  = window.defaultRepoBase;
    window.pathStack = [];
    
    return `Repo reset to ${window.repoName}`;
}
