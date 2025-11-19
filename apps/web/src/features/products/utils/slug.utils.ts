export function generateProductSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}
