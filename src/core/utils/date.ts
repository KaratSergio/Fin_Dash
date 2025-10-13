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

export function formatTimeline(date: number[] | null | undefined): string {
    if (!date || date.length < 3) return '';
    const [year, month, day] = date;
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`; // "YYYY-MM-DD"
}