export function normalizeFoodName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function foodMatchesQuery(foodName: string, query: string): boolean {
  const haystack = normalizeFoodName(foodName);
  const needle = normalizeFoodName(query);
  if (!needle) {
    return false;
  }
  return haystack.includes(needle);
}
