/*
 * @Date: 2022-11-02 16:56:57
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment } from 'react';
import { SelectBox } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import ProcessNode from './ProcessNode';
import ProcessDetail from './ProcessDetail';

const { Option } = SelectBox;

const Index = ({
  dispatch,
  activeValue,
  handleSelectBoxChange,
  detailDataSource,
  nodeDataSource,
  isUpgradeOrDegrade,
  strategyContentStyle,
}) => {
  // 处理折叠栏默认展开
  const {
    lifeCycleStrategyConditions = [],
    lifeCycleStrategyNodes = [],
    lifeCycleStrategyAction = {},
  } = detailDataSource || {};
  const conditionIds = lifeCycleStrategyConditions.map(n => String(n.strategyConditionId));
  const nodeIds = lifeCycleStrategyNodes.map(n => String(n.strategyNodeId));
  const actionId = String(lifeCycleStrategyAction?.strategyActionId);
  const defaultActiveKey = [...conditionIds, ...nodeIds, actionId];

  return isUpgradeOrDegrade ? (
    <Fragment>
      <SelectBox
        mode="button"
        value={activeValue}
        onChange={handleSelectBoxChange}
        className="process-select-box"
      >
        <Option value="processNode">
          {intl.get('sslm.workbench.model.process.node').d('流程节点')}
        </Option>
        <Option value="processDetail">
          {intl.get('sslm.workbench.model.process.detail').d('流程明细')}
        </Option>
      </SelectBox>
      <div style={{ height: '92%', overflowY: 'scroll' }}>
        {activeValue === 'processNode' && (
          <ProcessNode dataSource={nodeDataSource} dispatch={dispatch} />
        )}
        {activeValue === 'processDetail' && (
          <ProcessDetail dataSource={detailDataSource} defaultActiveKey={defaultActiveKey} />
        )}
      </div>
    </Fragment>
  ) : (
    <Fragment>
      <div className="strategy-title">
        {intl.get('sslm.workbench.model.title.detail').d('明细')}
      </div>
      <div className="strategy-content" style={{ ...strategyContentStyle }}>
        <ProcessDetail dataSource={detailDataSource} defaultActiveKey={defaultActiveKey} />
      </div>
    </Fragment>
  );
};

export default Index;
