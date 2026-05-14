
export function getForecastLabels(lastLabel: string, count: number): string[] {
  const labels: string[] = [];
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parts = lastLabel.split(' ');
  
  let startDate = new Date();
  if (parts.length === 2) {
    const monthIdx = months.indexOf(parts[0]);
    const day = parseInt(parts[1]);
    if (monthIdx !== -1 && !isNaN(day)) {
      startDate.setMonth(monthIdx);
      startDate.setDate(day);
    }
  }

  for (let i = 1; i <= count; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i * 7);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  
  return labels;
}
