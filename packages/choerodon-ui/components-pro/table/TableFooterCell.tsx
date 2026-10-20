import React, { CSSProperties, FunctionComponent, ReactElement, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import omit from 'lodash/omit';
import classNames from 'classnames';
import BigNumber from 'bignumber.js';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import math from 'choerodon-ui/dataset/math';
import Text from 'choerodon-ui/lib/text';
import TableContext from './TableContext';
import { ElementProps } from '../core/ViewComponent';
import { FieldType } from '../data-set/enum';
import { $l } from '../locale-context';
import { getColumnLock, isStickySupport, numberFieldFormat } from './utils';
import { ColumnAlign, ColumnLock, TableFooterSummaryType, CellType } from './enum';
import ColumnGroup from './ColumnGroup';
import { FooterHookOptions } from './Column';
import TableCellInner from './TableCellInner';
import { AggregationTreeProps, groupedAggregationTree } from './AggregationTree';

export interface TableFooterCellProps extends ElementProps {
  columnGroup: ColumnGroup;
  colSpan?: number;
  right: number;
}

const TableFooterCell: FunctionComponent<TableFooterCellProps> = function TableFooterCell(props) {
  const { columnGroup, style, className, colSpan, right } = props;
  const { rowHeight, dataSet, prefixCls, tableStore } = useContext(TableContext);
  const [summary, setSummary] = useState<number | BigNumber | '-'>('-');
  const { column } = columnGroup;
  const {
    autoFootHeight,
    footerRowHeight,
    aggregation,
    footerSummaryType,
    footerSummaryRenderResponse,
    props: { headerGroupExtraColumn },
  } = tableStore;
  const { footer, footerClassName, footerStyle = {}, align, name, command, lock, footerSummary, title } = column;
  const columnLock = isStickySupport() && tableStore.overflowX && getColumnLock(lock);
  const classString = classNames(`${prefixCls}-cell`, {
    [`${prefixCls}-cell-fix-${columnLock}`]: columnLock,
  }, className, footerClassName);
  const innerClassNames = [`${prefixCls}-cell-inner`];
  const innerProps: any = {};
  if (!autoFootHeight) {
    const $rowHeight = footerRowHeight === undefined ? rowHeight : footerRowHeight;
    if ($rowHeight !== 'auto') {
      innerProps.style = {
        height: pxToRem($rowHeight),
      };
      innerClassNames.push(`${prefixCls}-cell-inner-row-height-fixed`);
    }
  }
  const cellStyle: CSSProperties = {
    textAlign: align || (command ? ColumnAlign.center : tableStore.getConfig('tableColumnAlign')(column, dataSet.getField(name))),
    ...footerStyle,
    ...style,
  };
  const cellPrefix = `${prefixCls}-cell`;
  const aggregationTree = useMemo((): ReactElement<AggregationTreeProps>[] | undefined => {
    if (aggregation) {
      const { column: $column, headerGroup, headerGroups } = columnGroup;
      if (headerGroup) {
        const { tableGroup } = columnGroup;
        if (tableGroup) {
          const { columnProps } = tableGroup;
          const { totalRecords } = headerGroup;
          if (columnProps && totalRecords.length) {
            const { children } = columnProps;
            if (children && children.length) {
              const renderer = ({ colGroup, style, cellKey }) => {
                return (
                  <TableCellInner
                    record={totalRecords[0]}
                    column={colGroup.column}
                    style={style}
                    inAggregation
                    prefixCls={cellPrefix}
                    cellKey={cellKey}
                    cellType={CellType.footer}
                  />
                );
              };
              return groupedAggregationTree({
                columns: children,
                headerGroup,
                column: { ...$column, ...columnProps },
                renderer,
                hideLabel: Boolean(headerGroupExtraColumn && headerGroups),
                hideValue: Boolean(headerGroupExtraColumn && !headerGroups),
                rowIndex: 0,
                recordIndex: totalRecords[0] && totalRecords[0].index,
                cellType: CellType.footer,
              });
            }
          }
        }
      }
    }
  }, [columnGroup, aggregation, cellPrefix]);
  const field = name && dataSet.getField(name);
  const isNumberType = field && [FieldType.number, FieldType.currency].includes(field.type);
  useEffect(() => {
    computedSummary();
  }, [isNumberType, footerSummary, footerSummaryType, footerSummaryRenderResponse, name]);
  if (columnLock) {
    if (columnLock === ColumnLock.left) {
      cellStyle.left = pxToRem(columnGroup.left, true)!;
    } else if (columnLock === ColumnLock.right) {
      cellStyle.right = pxToRem(colSpan && colSpan > 1 ? right : columnGroup.right + right, true)!;
    }
  }
  const getFooter = (): ReactNode => {
    switch (typeof footer) {
      case 'function': {
        const footerHookOptions: FooterHookOptions = {
          dataSet,
          name,
          aggregationTree,
          tableStore,
        };
        try {
          return footer(footerHookOptions);
        } catch (e) {
          return footer(dataSet, name);
        }
      }
      case 'string':
        return <span>{footer}</span>;
      default:
        return footer;
    }
  };

  const computedSummary = async () => {
    if (footerSummary && isNumberType && name) {
      let result: number | BigNumber | '-' = '-';
      if (footerSummaryType === TableFooterSummaryType.all) {
        if (footerSummaryRenderResponse) {
          result = footerSummaryRenderResponse[name] || '-';
        }
      }
      setSummary(math.isBigNumber(result) ? math.fix(result) : result);
    }
  };

  const getFooterSummary = () => {
    if (isNumberType && field && name) {
      let result: number | BigNumber | '-' = '-';
      if (footerSummaryType !== TableFooterSummaryType.all) {
        const records = (footerSummaryType === TableFooterSummaryType.page ? dataSet.records : dataSet.selected).slice();
        if (records.length) {
          const sum = records.reduce((sum: number[], record) => {
            const value: number = record.get(name);
            sum.push(value);
            return sum;
          }, []).filter(Boolean);
          result = sum && sum.length ? math.sum(...sum) : 0;
        }
      }
      const text = <span>{title || field.get('label')}{$l('Table', 'footer_sum')}</span>;
      const summaryClass = `${prefixCls}-cell-inner-summary`;
      result = result === '-' ? '-' : numberFieldFormat(result, field);
      return (
        <div className={summaryClass}>
          <Text className={`${summaryClass}-sum`}>{footerSummaryType === TableFooterSummaryType.all ? summary : result}</Text>
          <Text className={`${summaryClass}-label`}>{text}</Text>
        </div>
      );
    }
    return undefined;
  };

  return (
    <th className={classString} style={omit(cellStyle, ['width', 'height'])} colSpan={colSpan} scope="col">
      <div {...innerProps} className={innerClassNames.join(' ')}>{footerSummary ? getFooterSummary() : getFooter()}</div>
    </th>
  );
};

TableFooterCell.displayName = 'TableFooterCell';

export default observer(TableFooterCell);
