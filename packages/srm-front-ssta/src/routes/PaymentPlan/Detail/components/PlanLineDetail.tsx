/*
 * @Description: 付款计划行详情
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-10-28 17:38:12
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import React from 'react';
import { Tabs } from 'choerodon-ui';
import type { Record } from 'choerodon-ui/dataset';

import intl from 'utils/intl';

import StageInfo from './StageInfo';
import StageAndRuleExeRecord from './StageAndRuleExeRecord';

const { TabPane } = Tabs;

interface PlanLineDetailProps {
  record: Record
};

const PlanLineDetail = (props: PlanLineDetailProps) => {

  const { record } = props;

  return (
    <Tabs>
      <TabPane
        key="info"
        title={intl.get('ssta.paymentPlan.view.title.payStageInfo').d('付款阶段信息')}
      >
        <StageInfo record={record} />
      </TabPane>
      <TabPane
        key="record"
        title={intl.get('ssta.paymentPlan.view.title.payStageAndCtrlRuleExeRecord').d('付款阶段及管控规则执行记录')}
      >
        <StageAndRuleExeRecord record={record} />
      </TabPane>
    </Tabs>
  );
};

export default PlanLineDetail;