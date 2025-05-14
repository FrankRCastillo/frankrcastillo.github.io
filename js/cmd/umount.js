export const description = "Unmount current repo and return to default.";

export default function umount() {
    window.repoName = window.defaultRepoName;
    window.repoBase = window.defaultRepoBase;
    return `Repo reset to ${window.repoName}`;
}
