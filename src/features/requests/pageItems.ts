export function pageItems(
  page: number,
  totalPages: number,
): Array<number | "gap"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const items: Array<number | "gap"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) items.push("gap");
  for (let current = start; current <= end; current++) items.push(current);
  if (end < totalPages - 1) items.push("gap");
  items.push(totalPages);
  return items;
}
