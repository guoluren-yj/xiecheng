/* eslint-disable no-lonely-if */
/* eslint-disable no-param-reassign */
/* eslint-disable react/default-props-match-prop-types */
/* eslint-disable react/require-default-props */
/* eslint-disable prefer-destructuring */
import React, { forwardRef } from 'react';
import { findDOMNode } from 'react-dom';
import { remove } from 'lodash';
import { Table as C7NTable } from 'choerodon-ui';
import C7NTableProps from 'hzero-ui/lib/table/overwriteProps';

const { Column, ColumnGroup, TableRowContext } = C7NTable;

function getRowSelection(props) {
  return props.rowSelection || {};
}

class AutoHeightTable extends C7NTable {
  static defaultProps = C7NTable.defaultProps;

  constructor(props) {
    super(props);
    const renderTable = this.renderTable.bind(this);
    this.store.setState({
      selectedRows: getRowSelection(props).selectedRows || [],
    });
    this.renderTable = (contextLocale, loading) => {
      const table = renderTable(contextLocale, loading);
      const { minHeight = 350, autoHeight, scroll } = this.props;
      if (autoHeight) {
        return React.cloneElement(table, {
          scroll: {
            ...scroll,
            y: this.state.scrollY > minHeight ? undefined : this.state.scrollY,
          },
        });
      }
      return table;
    };

    this.resize = () => {
      const { selector, toBottom = 150 } = this.props;
      if (this.element) {
        // eslint-disable-next-line react/no-find-dom-node
        let tableWrapperDom = findDOMNode(this.element);
        if (selector) {
          tableWrapperDom = tableWrapperDom.querySelector(selector);
        }
        const { top } = tableWrapperDom.getBoundingClientRect();
        this.setState({ scrollY: window.innerHeight - top - toBottom });
      }
    };

    this.animateFrame = () => {
      cancelAnimationFrame(this.frame);
      this.frame = requestAnimationFrame(this.resize);
    };
    window.addEventListener('resize', this.animateFrame);
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(nextProps);
    if (nextProps.rowSelection && 'selectedRows' in nextProps.rowSelection) {
      this.store.setState({
        selectedRows: nextProps.rowSelection.selectedRows || [],
      });
    }
  }

  componentDidMount() {
    this.resize();
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.frame);
    window.removeEventListener('resize', this.animateFrame);
  }

  setSelectedRowKeys(selectedRowKeys, selectionInfo, selectedRows = []) {
    const rowSelection = getRowSelection(this.props);
    if (rowSelection && !('selectedRows' in rowSelection)) {
      this.store.setState({ selectedRows });
    }
    super.setSelectedRowKeys(selectedRowKeys, selectionInfo, selectedRows);
  }

  getDefaultSelectionRows() {
    const rowSelection = getRowSelection(this.props);
    if (!rowSelection.getCheckboxProps) {
      return [];
    }
    return this.getFlatData().filter(
      (item, rowIndex) => this.getCheckboxPropsByItem(item, rowIndex).defaultChecked
    );
  }

  getSelectedRows({ e, selectionKey, record, rowIndex }) {
    const defaultSelectionRows = this.store.getState().selectionDirty
      ? []
      : this.getDefaultSelectionRows();
    let selectedRows = this.store.getState().selectedRows.concat(defaultSelectionRows);
    if (e) {
      const checked = e.target.checked;
      if (checked) {
        selectedRows.push(record);
      } else {
        const key = this.getRecordKey(record, rowIndex);
        selectedRows = selectedRows.filter((i) => key !== i[this.props.rowKey]);
      }
    }
    if (selectionKey) {
      const data = this.getFlatCurrentPageData();
      const changeableRows = data.filter(
        (item, i) => !this.getCheckboxPropsByItem(item, i).disabled
      );
      switch (selectionKey) {
        case 'all':
          changeableRows.forEach((row) => {
            if (!selectedRows.find((r) => r[this.props.rowKey] === row[this.props.rowKey])) {
              selectedRows.push(row);
            }
          });
          break;
        case 'removeAll':
          changeableRows.forEach((row) => {
            if (selectedRows.find((r) => r[this.props.rowKey] === row[this.props.rowKey])) {
              remove(
                selectedRows,
                selectedRows.find((r) => r[this.props.rowKey] === row[this.props.rowKey])
              );
            }
          });
          break;
        case 'invert':
          changeableRows.forEach((row) => {
            if (!selectedRows.find((r) => r[this.props.rowKey] === row[this.props.rowKey])) {
              selectedRows.push(row);
            } else {
              remove(
                selectedRows,
                selectedRows.find((r) => r[this.props.rowKey] === row[this.props.rowKey])
              );
            }
          });
          break;
        default:
          break;
      }
    }
    return selectedRows;
  }
}

const Table = forwardRef((props, ref) => {
  const { size, ...rest } = props;
  const tableProps = {
    ...C7NTableProps,
    ...rest,
  };
  if (size === 'middle') {
    tableProps.size = 'large';
  }
  return <AutoHeightTable {...tableProps} ref={ref} />;
});

Table.Column = Column;
Table.ColumnGroup = ColumnGroup;
Table.TableRowContext = TableRowContext;

export default Table;
