export function formatDateForApi(value: string): string {
    const d = new Date(value);
    const day = String(d.getDate()).padStart(2, '0');
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`; // "26 September 2025"
}