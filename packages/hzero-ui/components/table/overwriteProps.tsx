import React from 'react';
import classNames from 'classnames';
import type { SorterRenderProps, TableProps as TableC7NProps } from 'choerodon-ui/lib/table';
import C7NDropdownProps from '../dropdown/overwriteProps';
import C7NMenuProps from '../menu/overwriteProps';
import C7NButtonProps from '../button/overwriteProps';
import C7NInputNumberProps from '../input-number/overwriteProps';
import Icon from '../icon';
import C7NPaginationProps from '../pagination/overwriteProps';

function defaultRenderSorter<T>(props: SorterRenderProps<T>) {
  const { column, isSortColumn, sortOrder, prefixCls, changeOrder } = props;
  if (isSortColumn) {
    column.className = classNames(column.className, {
      [`${prefixCls}-column-sort`]: sortOrder,
    });
  }
  const isAscend = isSortColumn && sortOrder === 'ascend';
  const isDescend = isSortColumn && sortOrder === 'descend';
  return (
    <div className={`${prefixCls}-column-sorter`}>
      <span
        className={`${prefixCls}-column-sorter-up ${isAscend ? 'on' : 'off'}`}
        title="↑"
        onClick={() => changeOrder('ascend')}
      >
        <Icon type="caret-up" />
      </span>
      <span
        className={`${prefixCls}-column-sorter-down ${isDescend ? 'on' : 'off'}`}
        title="↓"
        onClick={() => changeOrder('descend')}
      >
        <Icon type="caret-down" />
      </span>
    </div>
  );
}

const C7NTableProps: TableC7NProps<any> = {
  prefixCls: 'ant-table',
  radioPrefixCls: 'ant-radio',
  checkboxPrefixCls: 'ant-checkbox',
  spinPrefixCls: 'ant-spin',
  renderSorter: defaultRenderSorter,
  dropdownProps: C7NDropdownProps,
  menuProps: C7NMenuProps,
  buttonProps: C7NButtonProps,
  inputNumberProps: C7NInputNumberProps,
  paginationProps: C7NPaginationProps,
  rippleDisabled: true,
  filterBar: false,
  resizable: true,
};

export default C7NTableProps;
