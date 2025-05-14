export const description = "Unmount current repo and return to default.";

export default function umount() {
    window.repoName = "FrankRCastillo/frankrcastillo"
    window.repoBase = `https://api.github.com/repos/${window.repoName}/contents`;
  
    return `Repo set to ${window.repoName}`;
}
