/**
 * OperationRecord - 操作记录页面
 * @date: 2019 1/13
 * @author: LZJ <zhijian.li@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { PureComponent } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';

import { operationTableDS } from './OperationRecordDS';
import CPopover from '@/routes/components/CPopover';

export default class OperationRecord extends PureComponent {
  tableDS = new DataSet(operationTableDS(this.props.rfxHeaderId));

  componentDidMount() {
    this.tableDS.query();
  }

  render() {
    const columns = [
      {
        name: 'processOperationMeaning',
        width: 100,
      },
      {
        name: 'processRemark',
        width: 120,
        renderer: ({ value }) => <CPopover content={value}>{value}</CPopover>,
      },
      {
        name: 'realName',
        width: 150,
      },
      {
        name: 'processDate',
        width: 150,
      },
    ];
    return <Table dataSet={this.tableDS} columns={columns} />;
  }
}
