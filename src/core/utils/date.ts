export function formatDateForApi(value: string | Date | null | undefined): string {
    if (!value) return '';

    const d = value instanceof Date ? value : new Date(value);

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

export function parseApiDate(dateArr: number[] | null | undefined): Date | null {
    if (!dateArr || !Array.isArray(dateArr)) return null;
    const [year, month, day] = dateArr;
    // month - 1 потому что в JS месяцы с 0 начинаются
    return new Date(year, month - 1, day);
}