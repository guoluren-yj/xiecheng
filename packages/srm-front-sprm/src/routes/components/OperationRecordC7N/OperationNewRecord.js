/**
 * OperationRecord  - 操作记录通用组件
 * @date: 2019-1-25
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Tabs } from 'hzero-ui';

import { isFunction } from 'lodash';
import { Table, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import ApproveHistory from './ApproveHistory';
import CancelingHistory from './CancelingHistory';
import { historyDs } from './operationDs';

const { TabPane } = Tabs;
@withRouter
export default class OperationRecord extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) props.onRef(this);
    const {
      record: { prHeaderId },
    } = this.props;
    this.historyList = new DataSet(historyDs(prHeaderId));
  }

  getCol = () => {
    const cols = [
      { name: 'processUserName' },
      { name: 'processedDate' },
      { name: 'processTypeCodeMeaning' },
      { name: 'processRemark' },
      { name: 'changeField' },
      { name: 'displayLineNum' },
      { name: 'oldValue', width: 250 },
      { name: 'newValue', width: 250 },
    ];
    return cols;
  };

  render() {
    const { record } = this.props;
    const columns = this.getCol();
    const tableProps = {
      dataSet: this.historyList,
      columns,
      data: [],
    };
    return (
      <Tabs animated={false}>
        <TabPane tab={intl.get(`hzero.common.button.operating`).d('操作记录')} key="operation">
          <Table {...tableProps} />
        </TabPane>
        <TabPane tab={intl.get(`hzero.common.button.approveHistory`).d('审批记录')} key="approve">
          <ApproveHistory
            record={record}
            onRef={(node) => {
              this.approveHistory = node;
            }}
          />
        </TabPane>
        <TabPane tab={intl.get(`hzero.common.button.cancelHistory`).d('取消审批记录')} key="cancel">
          <CancelingHistory
            record={record}
            onRef={(node) => {
              this.approveHistory = node;
            }}
          />
        </TabPane>
      </Tabs>
    );
  }
}
