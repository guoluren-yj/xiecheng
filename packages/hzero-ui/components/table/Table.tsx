import type { MutableRefObject, ReactElement } from 'react';
import React, { forwardRef } from 'react';
import C7NTable from 'choerodon-ui/lib/table';
import { Size } from 'choerodon-ui/lib/_util/enum';
import type { TableProps as TableC7NProps } from './interface';
import C7NTableProps from './overwriteProps';

export interface TableProps<T> extends Omit<TableC7NProps<T>, 'size'> {
  size?: Size | 'middle';
}

const { Column, ColumnGroup, TableRowContext } = C7NTable;

export { Column, ColumnGroup, TableRowContext };

function tableForwardRefRenderFunction<T>(props: TableProps<T>, ref: ((instance: C7NTable<T> | null) => void) | MutableRefObject<C7NTable<T> | null> | null): ReactElement | null {
  const { size, ...rest } = props;
  const tableProps: TableC7NProps<T> = {
    ...C7NTableProps,
    ...rest,
  };
  if (size === 'middle') {
    tableProps.size = Size.large;
  }
  return <C7NTable {...tableProps} ref={ref} />;
}

const Table = forwardRef(tableForwardRefRenderFunction);

type TableType = typeof Table & {
  Column: typeof Column;
  ColumnGroup: typeof ColumnGroup;
  TableRowContext: typeof TableRowContext;
}

(Table as TableType).Column = Column;
(Table as TableType).ColumnGroup = ColumnGroup;
(Table as TableType).TableRowContext = TableRowContext;


export default Table as TableType;
