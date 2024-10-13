const DEFAULT_ITEMS_PER_PAGE = 5;
const MIN_ITEMS_PER_PAGE = 1;
const MAX_ITEMS_PER_PAGE = 15;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// TODO: check parsing
// TODO: check the range just after parsing, if invalid return the default
export function getItemsPerPage(value: string): number {
  let result = Number(value) || DEFAULT_ITEMS_PER_PAGE;
  return clamp(result, MIN_ITEMS_PER_PAGE, MAX_ITEMS_PER_PAGE);
}

export function getPage(value: string): number {
  return Math.max(Number(value) || 1, 1);
}
