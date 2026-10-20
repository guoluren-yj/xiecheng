import React, { FunctionComponent, Key, memo, useCallback, useContext } from 'react';
import { action } from 'mobx';
import { ClickParam } from 'choerodon-ui/lib/menu';
import Record from '../data-set/Record';
import TableContext from './TableContext';
import Dropdown from '../dropdown/Dropdown';
import Menu from '../menu';
import { $l } from '../locale-context';
import { stopEvent } from '../_util/EventManager';
import { Group } from '../data-set/DataSet';
import { EXPAND_KEY, GROUP_EXTRA_KEY } from './TableStore';

export interface AggregationButtonProps {
  expanded: boolean;
  isColumnGroup?: boolean;
  record?: Record;
  rowGroup?: Group;
  headerGroup?: Group;
  aggregationExpandKey: Key;
  index: number;
}

const AggregationButton: FunctionComponent<AggregationButtonProps> = function AggregationButton(props) {
  const { expanded, record, rowGroup, headerGroup, aggregationExpandKey, isColumnGroup, index } = props;
  const { tableStore, prefixCls } = useContext(TableContext);
  const isHeaderExtraColumn = String(aggregationExpandKey).startsWith(GROUP_EXTRA_KEY);
  const handleMenuClick = useCallback(action(({ key }: Partial<ClickParam>) => {
    switch (key) {
      case 'cell': {
        if (record) {
          tableStore.setAggregationCellExpanded(record, aggregationExpandKey, !expanded, index);
        } else if (headerGroup) {
          headerGroup.setState(`${EXPAND_KEY}-${index}`, !expanded);
        }
        break;
      }
      case 'row': {
        if (rowGroup && (headerGroup || isColumnGroup)) {
          tableStore.columnGroups.allLeafs.forEach(({ column: col, key: columnKey }) => {
            if (col.aggregation) {
              rowGroup.totalRecords.forEach(r => {
                tableStore.setAggregationCellExpanded(r, columnKey, !expanded, index);
              });
            }
          });
        } else if (headerGroup) {
          tableStore.columnGroups.allLeafs.forEach(({ headerGroup: $headerGroup }) => {
            if ($headerGroup) {
              $headerGroup.setState(`${EXPAND_KEY}-${index}`, !expanded);
            }
          });
        } else if (record) {
          tableStore.columnGroups.allLeafs.forEach(({
            column: col,
            key: columnKey,
          }) => col.aggregation && tableStore.setAggregationCellExpanded(record, columnKey, !expanded, index));
        }
        break;
      }
      case 'column': {
        if (record) {
          record.dataSet.forEach(r => tableStore.setAggregationCellExpanded(r, aggregationExpandKey, !expanded, index));
          if (headerGroup) {
            headerGroup.setState(`${EXPAND_KEY}-${index}`, !expanded);
          }
        } else if (headerGroup) {
          headerGroup.totalRecords.forEach(r => tableStore.setAggregationCellExpanded(r, aggregationExpandKey, !expanded, index));
          headerGroup.setState(`${EXPAND_KEY}-${index}`, !expanded);
        }
        break;
      }
      default:
    }
  }), [tableStore, record, aggregationExpandKey, expanded, headerGroup, rowGroup]);
  const handleClick = useCallback(() => {
    handleMenuClick({ key: isHeaderExtraColumn ? 'row' : tableStore.aggregationExpandType });
  }, [handleMenuClick, tableStore]);
  const getOverlay = useCallback(() => (
    <Menu prefixCls={`${prefixCls}-dropdown-menu`} onClick={handleMenuClick}>
      <Menu.Item key="cell">{$l('Table', expanded ? 'collapse_cell' : 'expand_cell')}</Menu.Item>
      <Menu.Item key="row">{$l('Table', expanded ? 'collapse_row' : 'expand_row')}</Menu.Item>
      <Menu.Item key="column">{$l('Table', expanded ? 'collapse_column' : 'expand_column')}</Menu.Item>
    </Menu>
  ), [prefixCls, handleMenuClick, expanded]);
  return (
    <span className={`${prefixCls}-cell-expand`} onClick={stopEvent}>
      <button type="button" className={`${prefixCls}-cell-expand-btn`} onClick={handleClick}>
        {$l('Table', expanded ? 'collapse' : 'expand_button')}
      </button>
      {
        !isHeaderExtraColumn && tableStore.aggregationExpandTypeChangeable && (
          <Dropdown overlay={getOverlay}>
            <span className={`${prefixCls}-cell-expand-menu-btn`} />
          </Dropdown>
        )
      }
    </span>
  );
};

AggregationButton.displayName = 'AggregationButton';

export default memo(AggregationButton);
