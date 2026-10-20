/**
 * 快速入口组件
 */
import React from 'react';
import { Row, Col, Tooltip } from 'choerodon-ui/pro'; // Icon,
import intl from 'utils/intl';
import querystring from 'querystring';
import { ReactComponent as RiskDefinitionSvg } from '@/assets/risk/riskDefinition.svg';
// import { ReactComponent as BlackListSvg } from '@/assets/risk/blackList.svg';

import styles from './index.less';

export default function EntranceComp(props) {
  const { history, permissions = [] } = props;

  const handleJump = async tag => {
    const {
      location: { search },
    } = history;
    const { fromPage } = search ? querystring.parse(search.substr(1)) : {};
    switch (tag) {
      case '1':
        // 风险定义
        history.push(
          fromPage === 'roleControl'
            ? '/swbh/role-workbench/risk-definition'
            : '/sdat/risk-workbench-new/scheme-config/list'
        );
        break;
      case '2':
        history.push(
          fromPage === 'roleControl'
            ? '/swbh/role-workbench/supplier-blacklist-manage?backPath=1'
            : '/sdat/risk-workbench-new/supplier-blacklist-manage/list'
        );
        break;
      case '3':
        history.push(
          fromPage === 'roleControl' ? '' : '/sdat/risk-workbench-new/monitor-plan/list'
        );
        break;

      case '4':
        history.push(
          fromPage === 'roleControl' ? '' : '/sdat/risk-workbench-new/risk-control-manage'
        );
        break;

      case '5':
        history.push(
          fromPage === 'roleControl' ? '' : '/sdat/risk-workbench-new/risk-assessment-config'
        );
        break;

      default:
        return null;
    }
  };

  return (
    <div>
      <div
        style={{
          fontSize: '16px',
          fontWeight: '600',
          lineHeight: '24px',
        }}
      >
        {intl.get('sdat.riskControl.view.title.fastEntry').d('快速入口')}
      </div>
      <Row style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap' }}>
        {permissions.includes('risk-workbench-new.api.risk-monitor-plan-entrance') ? (
          <Col span={12}>
            <div className={styles['risk-control-entrance-comp']} onClick={() => handleJump('4')}>
              <span className={styles['risk-workplace-fast-entry-icon']}>
                <RiskDefinitionSvg />
              </span>
              <Tooltip
                title={intl.get('sdat.riskControl.view.button.riskEntranceManage').d('风控管理')}
              >
                <span
                  style={{
                    lineHeight: '18px',
                    maxWidth: '160px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {intl.get('sdat.riskControl.view.button.riskEntranceManage').d('风控管理')}
                </span>
              </Tooltip>
            </div>
          </Col>
        ) : null}

        {permissions.includes('risk-workbench-new.api.risk-monitor-plan-entrance') ? (
          <Col span={12}>
            <div className={styles['risk-control-entrance-comp']} onClick={() => handleJump('3')}>
              <span className={styles['risk-workplace-fast-entry-icon']}>
                <RiskDefinitionSvg />
              </span>
              <Tooltip
                title={intl
                  .get('sdat.riskControl.view.button.riskMonitorPlanDefinition')
                  .d('风险监控方案定义')}
              >
                <span
                  style={{
                    lineHeight: '18px',
                    maxWidth: '160px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {intl
                    .get('sdat.riskControl.view.button.riskMonitorPlanDefinition')
                    .d('风险监控方案定义')}
                </span>
              </Tooltip>
            </div>
          </Col>
        ) : null}

        {permissions.includes('risk-workbench-new.api.risk-scan-plan-entrance') ? (
          <Col span={12}>
            <div className={styles['risk-control-entrance-comp']} onClick={() => handleJump('1')}>
              <span className={styles['risk-workplace-fast-entry-icon']}>
                <RiskDefinitionSvg />
              </span>
              <Tooltip
                title={intl
                  .get('sdat.riskControl.view.button.riskScanPlanDefinition')
                  .d('风险扫描方案定义')}
              >
                <span
                  style={{
                    lineHeight: '18px',
                    maxWidth: '160px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {intl
                    .get('sdat.riskControl.view.button.riskScanPlanDefinition')
                    .d('风险扫描方案定义')}
                </span>
              </Tooltip>
            </div>
          </Col>
        ) : null}

        {permissions.includes('risk-workbench-new.api.risk-index-manage') ? (
          <Col span={12}>
            <div className={styles['risk-control-entrance-comp']} onClick={() => handleJump('5')}>
              <span className={styles['risk-workplace-fast-entry-icon']}>
                <RiskDefinitionSvg />
              </span>
              <Tooltip
                title={intl
                  .get('sdat.riskControl.view.button.riskIndexManage')
                  .d('风控评估指标管理')}
              >
                <span
                  style={{
                    lineHeight: '18px',
                    maxWidth: '160px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {intl.get('sdat.riskControl.view.button.riskIndexManage').d('风控评估指标管理')}
                </span>
              </Tooltip>
            </div>
          </Col>
        ) : null}

        {/* {permissions.includes('risk-workbench-new.api.black-list-entrance') ? (
          <Col span={12}>
            <div className={styles['risk-control-entrance-comp']} onClick={() => handleJump('2')}>
              <span className={styles['risk-workplace-fast-entry-icon']}>
                <BlackListSvg />
              </span>
              <span style={{ lineHeight: '18px' }}>
                {intl.get('sdat.riskControl.view.button.blackListCompany').d('黑名单企业')}
              </span>
            </div>
          </Col>
        ) : null} */}
      </Row>
    </div>
  );
}
