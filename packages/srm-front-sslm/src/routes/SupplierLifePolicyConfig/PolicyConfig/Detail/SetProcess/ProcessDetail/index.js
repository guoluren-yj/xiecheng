/*
 * @Date: 2024-03-18 09:36:36
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { head, isEmpty } from 'lodash';
import { Collapse, Icon } from 'choerodon-ui';
import React, { Fragment, useState, useCallback, useEffect } from 'react';

import intl from 'utils/intl';

const { Panel } = Collapse;

const ProcessDetail = ({ dataSource, defaultActiveKey }) => {
  const {
    lifeCycleStrategyAction = [],
    lifeCycleStrategyConditions = [],
    lifeCycleStrategyNodes = [],
  } = dataSource;

  const [activeKey, setActiveKey] = useState([]);

  useEffect(() => {
    setActiveKey(defaultActiveKey);
  }, [defaultActiveKey]);

  const handleCollapseChange = useCallback(key => {
    setActiveKey(key);
  }, []);

  const getExpandIcon = useCallback(
    panelProps => {
      const { isActive, id } = panelProps;
      const { strategyActionId } = lifeCycleStrategyAction || {};
      if (id === strategyActionId || !strategyActionId) {
        // strategyActionId后端可能不返回，说是没存数据
        return null;
      } else if (isActive) {
        return <Icon type="expand_more" style={{ cursor: 'pointer' }} />;
      } else {
        return <Icon type="expand_less" style={{ cursor: 'pointer' }} />;
      }
    },
    [lifeCycleStrategyAction]
  );

  return (
    <Fragment>
      <div className="detail-title" id="detailTitle">
        {intl.get('sslm.common.view.field.detail').d('明细')}
      </div>
      <div className="detail-content">
        <Collapse
          trigger="text-icon"
          activeKey={activeKey}
          expandIconPosition="right"
          onChange={handleCollapseChange}
          expandIcon={panelProps => getExpandIcon(panelProps)}
        >
          {lifeCycleStrategyConditions.map((condition, conditionIndex) => {
            const { strategyConditionAuthFilters = [] } = condition || {};
            return (
              <Panel
                header={
                  <Fragment>
                    <div className="detail-item-title">
                      {`${intl.get('sslm.common.model.condition').d('判断条件')}-${conditionIndex +
                        1}`}
                    </div>
                    <div className="detail-item-label">{condition.conditionDesc}</div>
                  </Fragment>
                }
                id={condition.strategyConditionId}
                key={String(condition.strategyConditionId)}
              >
                <div className="detail-item-content">
                  <div className="detail-item-title">
                    {intl.get('sslm.common.modal.permissionsControl').d('权限控制')}
                  </div>
                  <div>
                    {condition.authManualFlag
                      ? intl
                          .get('sslm.workbench.model.platformSupplier.authManual')
                          .d('允许手工发起')
                      : intl
                          .get('sslm.workbench.model.platformSupplier.notAuthManual')
                          .d('不允许手工发起')}
                  </div>
                  {strategyConditionAuthFilters.map((item, index) => (
                    <div>
                      {`#${index + 1} ${item.filterDataMeaning} ${
                        item.filterConditionMeaning
                      } ${item.filterValueMeaning || item.filterValue}`}
                    </div>
                  ))}
                  {condition.authTacticsRule && (
                    <div>
                      {intl.get('sslm.common.model.combination.rules').d('组合规则')}
                      <span className="detail-rules">{condition.authTacticsRule}</span>
                    </div>
                  )}
                </div>
              </Panel>
            );
          })}
          {lifeCycleStrategyNodes.map((node, nodeIndex) => {
            const { lifeCycleStrategyNodeFilters = [] } = node || {};
            return (
              <Panel
                header={
                  <Fragment>
                    <div className="detail-item-title">
                      {`${intl.get('sslm.common.view.node').d('节点')}-${nodeIndex + 1}`}
                    </div>
                    <div className="detail-item-label">{node.nodeDesc}</div>
                  </Fragment>
                }
                id={node.strategyNodeId}
                key={String(node.strategyNodeId)}
              >
                <div className="detail-item-content">
                  <div>
                    <span className="detail-item-content-label">
                      {intl
                        .get('sslm.supplierLifePolicyConfig.modal.config.nodeType')
                        .d('节点类型')}
                    </span>
                    <span className="detail-rules">{node.nodeTypeMeaning}</span>
                  </div>
                  <div>
                    <span className="detail-item-content-label">
                      {node.nodeType === 'REGULATION'
                        ? intl
                            .get('sslm.supplierLifePolicyConfig.modal.config.regulationType')
                            .d('规则类型')
                        : intl
                            .get('sslm.supplierLifePolicyConfig.modal.config.documentType')
                            .d('单据类型')}
                    </span>
                    <span className="detail-rules">{node.documentTypeMeaning}</span>
                  </div>
                  {node.nodeType !== 'REGULATION' &&
                    Boolean((head(lifeCycleStrategyConditions) || {}).authManualFlag) && (
                      <Fragment>
                        <div>
                          <span className="detail-item-content-label">
                            {intl
                              .get('sslm.common.view.field.strongControlFlag')
                              .d('手工发起升降级时强管控')}
                          </span>
                          <span className="detail-rules">{node.controlFlagMeaning}</span>
                        </div>
                        <div>
                          <span className="detail-item-content-label">
                            {intl.get('sslm.common.model.field.queryDocRule').d('查询单据规则')}
                          </span>
                          <span className="detail-rules">{node.queryDocRuleMeaning}</span>
                        </div>
                      </Fragment>
                    )}
                  {lifeCycleStrategyNodeFilters.map((item, index) => (
                    <div>
                      {`#${index + 1} ${item.filterDataMeaning} ${
                        item.filterConditionMeaning
                      } ${item.filterValueMeaning || item.filterValue}`}
                    </div>
                  ))}
                  {node.nodeTacticsRule && (
                    <div>
                      <span className="detail-item-content-label">
                        {intl.get('sslm.common.model.combination.rules').d('组合规则')}
                      </span>
                      <span className="detail-rules">{node.nodeTacticsRule}</span>
                    </div>
                  )}
                  {node.nodeType === 'REGULATION' && (
                    <div>
                      <span className="detail-item-content-label">
                        {intl.get('sslm.common.view.message.executionRule').d('执行规则')}
                      </span>
                      <span className="detail-rules">
                        {`${intl
                          .get('sslm.supplierLifePolicyConfig.modal.config.days')
                          .d('天数')} ${intl
                          .get('sslm.common.model.rulesDefinition.equals')
                          .d('等于')} ${node.ruleValue}`}
                      </span>
                    </div>
                  )}
                </div>
              </Panel>
            );
          })}
          {!isEmpty(lifeCycleStrategyAction) && (
            <Panel
              header={
                <Fragment>
                  <div className="detail-item-title">
                    {intl.get('sslm.common.model.action').d('后置动作')}
                  </div>
                  <div className="detail-item-label">
                    {lifeCycleStrategyAction.autoUpgradeFlag
                      ? intl
                          .get('sslm.supplierLifePolicyConfig.modal.config.autoUpgradeFlag')
                          .d('自动升级到目标阶段')
                      : intl
                          .get('sslm.supplierLifePolicyConfig.modal.config.notAutoUpgradeFlag')
                          .d('不自动升级到目标阶段')}
                  </div>
                </Fragment>
              }
              id={lifeCycleStrategyAction?.strategyActionId}
              key={String(lifeCycleStrategyAction?.strategyActionId)}
              className="action-panel-wrap"
            />
          )}
        </Collapse>
      </div>
    </Fragment>
  );
};

export default ProcessDetail;
