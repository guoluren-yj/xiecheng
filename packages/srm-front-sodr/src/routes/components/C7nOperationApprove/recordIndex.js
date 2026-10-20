/**
 * @Description:动态渲染
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2021-09-06
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import React, { useState, useCallback } from 'react';
import { Tabs } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import Record from './Record';
import Approve from './NewApprove';

const { TabPane } = Tabs;
const C7nOperationApprove = (props) => {
  const { poHeaderId } = props;
  const [activeKey, setActiveKey] = useState('operator');
  const handleViewDetail = useCallback(() => {
    setActiveKey('approval');
  }, []);
  const handleChangeTab = useCallback(
    (tabKey) => {
      if (activeKey === tabKey) return;
      setActiveKey(tabKey);
    },
    [activeKey]
  );
  const operaProps = {
    poHeaderId,
    onViewDetail: handleViewDetail,
  };
  const approval = {
    poHeaderId,
  };
  return (
    <Tabs defaultActiveKey={activeKey} activeKey={activeKey} onChange={handleChangeTab}>
      <TabPane
        tab={intl.get(`sodr.workspace.view.option.operationRecord`).d('操作记录')}
        key="operator"
      >
        <Record {...operaProps} />
      </TabPane>
      <TabPane
        tab={intl.get('sodr.workspace.view.option.approvalRecord').d('审批记录')}
        key="approval"
      >
        <Approve {...approval} />
      </TabPane>
    </Tabs>
  );
};
export default C7nOperationApprove;
