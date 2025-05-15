export const description = "Unmount current repo and return to default.";

export default function umount() {
    window.repoName  = window.defaultRepoName;
    window.repoBase  = window.defaultRepoBase;
    window.pathStack = [];
    
    return `Repo reset to ${window.repoName}`;
}
