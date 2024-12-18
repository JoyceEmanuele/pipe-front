export function filterByColumns<S>(array: S[], columns: (keyof S)[], searchText: string): S[] {
  searchText = searchText.toLowerCase();
  if (!searchText) return [...array];
  const searchTerms = searchText.split('/').filter((x) => !!x);
  return array.filter((item) => {
    for (const searchTerm of searchTerms) {
      const found = columns.some((colName) => {
        if (item[colName] && (item[colName] as unknown as string).toLowerCase && (item[colName] as unknown as string).toLowerCase().includes(searchTerm)) {
          return true;
        }
      });
      if (!found) return false;
    }
    return true;
  });
}

export function orderByColumns(array: any[], column: string, descending: boolean) {
  function sorter(a: any, b: any) {
    if ((a[column]) && (!b[column])) return -1;
    if ((!a[column]) && (b[column])) return 1;
    if (a[column] > b[column]) return 1;
    if (a[column] < b[column]) return -1;
    return 0;
  }
  function revSorter(a: any, b: any) {
    return -sorter(a, b);
  }
  return array.sort(descending ? revSorter : sorter);
}
