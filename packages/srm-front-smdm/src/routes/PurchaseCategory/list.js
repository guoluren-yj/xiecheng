/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-06-03 15:24:41
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-02-03 14:03:11
 */
import React, { PureComponent } from 'react';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import Table from '@/components/VirtualTable';
import { Table as C7NTable } from 'choerodon-ui/pro';

@WithCustomize({
  unitCode: ['SMDM.PURCHASE_CATEGORY_LIST.GRID'],
})
export default class ListTable extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      customizeVTable,
      loading,
      data,
      columns,
      expandedRowKeys = [],
      onExpandChange,
      sortType,
      sortColumn,
      rowSelection,
      onSortColumn,
      dataSet,
      customizeTable,
      categoryQueryPage,
    } = this.props;

    if (categoryQueryPage) {
      return customizeTable(
        {
          code: 'SMDM.PURCHASE_CATEGORY_LIST.GRID',
          dataSet,
        },
        <C7NTable
          mode="tree"
          // bordered
          treeAsync
          // rowKey="categoryId"
          // loading={loading}
          // data={data}
          dataSet={dataSet}
          columns={columns}
          height={600}
          // sortType={sortType}
          customizedCode="SMDM.PURCHASE_CATEGORY_LIST.GRID"
          style={{ maxHeight: 'calc(100vh - 310px)' }}
          // sortColumn={sortColumn}
          // onSortColumn={onSortColumn}
          // expandedRowKeys={expandedRowKeys}
          // pagination={false}
          // rowSelection={rowSelection}
          // onExpandChange={onExpandChange}
          onRow={({ record }) => {
            const nodeProps = {};
            if (record.get('hasChild') === '0') {
              nodeProps.isLeaf = true;
            }
            return nodeProps;
          }}
        />
      );
    }
    return customizeVTable(
      {
        code: 'SMDM.PURCHASE_CATEGORY_LIST.GRID',
        dataSet,
      },
      <Table
        isTree
        bordered
        rowKey="categoryId"
        loading={loading}
        data={data}
        columns={columns}
        height={600}
        sortType={sortType}
        sortColumn={sortColumn}
        onSortColumn={onSortColumn}
        expandedRowKeys={expandedRowKeys}
        pagination={false}
        rowSelection={rowSelection}
        onExpandChange={onExpandChange}
      />
    );
  }
}
