const formatter = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

export function formatDate(iso: string): string {
  return formatter.format(new Date(iso));
}
