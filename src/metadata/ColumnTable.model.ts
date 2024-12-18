export interface ColumnTable {
  Header: (props?: any) => JSX.Element;
  Cell: (props: any) => JSX.Element;
  accessor: string;
  disableSortBy: boolean;
}
