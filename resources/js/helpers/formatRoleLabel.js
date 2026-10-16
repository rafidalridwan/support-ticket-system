export default function formatRoleLabel(label) {
    return label ==='school' ?"School Administrator": label.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}