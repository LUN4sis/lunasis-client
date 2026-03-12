// convert items to { key, display } format for SelectionGroup
export function toOptions(items: { id: string; label: string }[]): { key: string; display: string }[] {
  return items.map((i) => ({ key: i.id, display: i.label }));
}

// toggle presence of value in array (for multi-select)
export function toggle(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}