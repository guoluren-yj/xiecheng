/**
 * DynamicTable - 动态表格
 * @date: 2019-10-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React from 'react';
import { Tabs } from 'hzero-ui';

import DynamicTable from './components/DynamicTable';

const { TabPane } = Tabs;

export const getDynamicTable = (props = {}) => {
  const { tableList = [], queryParams, parentRef = {}, ...otherProps } = props;
  const tabs = [];
  tableList.forEach(n => {
    const modelTable = {
      ...n,
      ...queryParams,
    };
    const tableProps = {
      modelTable,
      ...otherProps,
      onRef: (ref = {}) => {
        parentRef[n.tableCode] = ref;
      },
    };
    tabs.push(
      <TabPane tab={n.tableName} key={n.tableCode} forceRender>
        <DynamicTable {...tableProps} />
      </TabPane>
    );
  });
  return tabs;
};
