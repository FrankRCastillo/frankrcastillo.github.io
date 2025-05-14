export const description = "Unmount current repo and return to default.";

export default function umount() {
    window.repoBase = 'https://api.github.com/repos/FrankRCastillo/frankrcastillo.github.io/contents';
  
    return 'unmounted repo, returned to default';
}
