/**
 * 快速入口组件
 */
import React from 'react';
import { Row, Col } from 'choerodon-ui/pro'; // Icon,
import intl from 'utils/intl';
import querystring from 'querystring';

import { ReactComponent as RiskDefinitionSvg } from '@/assets/risk/riskDefinition.svg';
import { ReactComponent as BlackListSvg } from '@/assets/risk/blackList.svg';
import { ReactComponent as MonitorBusinessSvg } from '@/assets/risk/monitorBusiness.svg';
import { ReactComponent as RiskBusinessSvg } from '@/assets/risk/riskBusiness.svg';

import styles from './index.less';

export default function EntranceComp(props) {
  const { history } = props;
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
            : '/sdat/risk-control-workbench/risk-definition/list'
        );
        break;
      case '2':
        history.push(
          fromPage === 'roleControl'
            ? '/swbh/role-workbench/monitor-business?riskFlag=1'
            : '/sdat/risk-control-workbench/monitor-business?riskFlag=1'
        );
        break;
      case '3':
        history.push(
          fromPage === 'roleControl'
            ? '/swbh/role-workbench/monitor-business'
            : '/sdat/risk-control-workbench/monitor-business'
        );
        break;
      case '4':
        history.push(
          fromPage === 'roleControl'
            ? '/swbh/role-workbench/supplier-blacklist-manage?backPath=1'
            : '/sdat/risk-control-workbench/supplier-blacklist-manage?backPath=1'
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
      <Row style={{ marginTop: '16px', display: 'flex', flexDirection: '' }}>
        <Col span={12}>
          <div className={styles['risk-control-entrance-comp']} onClick={() => handleJump('1')}>
            <span className={styles['risk-workplace-fast-entry-icon']}>
              <RiskDefinitionSvg />
            </span>
            <span style={{ lineHeight: '18px' }}>
              {intl.get('sdat.riskControl.view.button.riskDefinition').d('⻛险定义')}
            </span>
          </div>
        </Col>

        <Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div className={styles['risk-control-entrance-comp']} onClick={() => handleJump('2')}>
            <span className={styles['risk-workplace-fast-entry-icon']}>
              <RiskBusinessSvg />
            </span>
            <span style={{ lineHeight: '18px' }}>
              {intl.get('sdat.riskControl.view.button.riskCompany').d('⻛险企业')}
            </span>
          </div>
        </Col>
      </Row>

      <Row style={{ marginTop: '8px' }}>
        <Col span={12}>
          <div className={styles['risk-control-entrance-comp']} onClick={() => handleJump('3')}>
            <span className={styles['risk-workplace-fast-entry-icon']}>
              <MonitorBusinessSvg />
            </span>
            <span style={{ lineHeight: '18px' }}>
              {intl.get('sdat.riskControl.view.button.monitorBusiness').d('监控企业')}
            </span>
          </div>
        </Col>

        <Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div className={styles['risk-control-entrance-comp']} onClick={() => handleJump('4')}>
            <span className={styles['risk-workplace-fast-entry-icon']}>
              <BlackListSvg />
            </span>
            <span style={{ lineHeight: '18px' }}>
              {intl.get('sdat.riskControl.view.button.blackListCompany').d('黑名单企业')}
            </span>
          </div>
        </Col>
      </Row>
    </div>
  );
}
