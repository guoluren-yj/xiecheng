/**
 * 供应商风险监控
 * @date: 2022-09-02
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useState, useEffect } from 'react';
import { DataSet, Icon, TextField, Tooltip } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { routerRedux } from 'dva/router';
import { Button as PermissionButton } from 'components/Permission';

import { getUpdateTime, getIfPermitted } from '@/services/supplierRiskMonitorOrgService';
import { newsListDS, eventsListDS } from './store/newsListDs';

import OrgRiskLevel from './OrgRiskLevel';
import PublicOpinionDistribution from './PublicOpinionDistribution';
import RiskTabPanel from './RiskTabPanel';
import AddRiskStuff from './AddRiskStuff';
import LatestPublicOpinion from './LatestPublicOpinion';

import style from './index.less';

// 权限集
const monitorOrgBtnPmn = 'srm.bg.manager.enterprise-control.monitor-overview.button.monitor-org'; // 监控企业按钮
const dynamicMonitorBtnPmn =
  'srm.bg.manager.enterprise-control.monitor-overview.button.dynamic-monitor'; // 动态监控事件定义按钮

const dateObj = new Date();
const dateTime = `${dateObj.getFullYear()}-${
  dateObj.getMonth() + 1
}-${dateObj.getDate()} ${dateObj.getHours()}:${dateObj.getMinutes()}:${dateObj.getSeconds()}`;

function SupplierRiskMonitorOrg(props = {}) {
  const { newsListDs, eventsListDs } = props.valueDs;

  const [timeValue, setTimeValue] = useState(dateTime);
  const [canSearch, setCanSearch] = useState(false);

  // 查询用户是否有订单可以查看
  useEffect(() => {
    getIfPermitted().then((res) => {
      if (getResponse(res)) setCanSearch(res?.openFlag ?? false);
    });
  }, []);

  useEffect(() => {
    if (!canSearch) return;
    getUpdateTime().then((res) => {
      setTimeValue(res?.updateTime ?? dateTime);
    });
  }, [canSearch]);

  /**
   * handleSkipMonitorOrg: 跳转监控企业
   */
  const handleSkipMonitorOrg = () => {
    props.dispatch(
      routerRedux.push({
        pathname: '/sdat/supplier-risk-monitor-org/monitor-business',
      })
    );
  };

  /**
   * handleSkipDynamicMonitor: 跳转动态监控企业
   */
  const handleSkipDynamicMonitor = () => {
    props.dispatch(
      routerRedux.push({
        pathname: '/sdat/supplier-risk-monitor-org/dynamic-monitor',
      })
    );
  };

  return (
    <>
      <Header
        title={
          <>
            {intl.get('sdat.supplierRiskMonitor.view.header.title').d('监控概览')}
            {canSearch && (
              <Tooltip
                placement="top"
                title={intl
                  .get('sdat.supplierRiskMonitor.view.tooltip.lastUpdatedTime')
                  .d('最后更新时间')}
              >
                <TextField
                  value={timeValue}
                  prefix={<Icon type="update" style={{ marginRight: '8px' }} />}
                  border={false}
                  disabled
                  style={{
                    backgroundColor: 'transparent',
                    fontSize: '12px',
                    margin: '-4px 0 auto 16px',
                  }}
                />
              </Tooltip>
            )}
          </>
        }
      >
        <PermissionButton
          onClick={handleSkipMonitorOrg}
          permissionList={[{ code: monitorOrgBtnPmn }]}
          type="c7n-pro"
          icon="home_work-o"
          funcType="flat"
        >
          {intl.get('sdat.supplierRiskMonitor.view.button.monitorOrg').d('监控企业')}
        </PermissionButton>
        <PermissionButton
          onClick={handleSkipDynamicMonitor}
          permissionList={[{ code: dynamicMonitorBtnPmn }]}
          type="c7n-pro"
          icon="settings-o"
          funcType="flat"
        >
          {intl
            .get('sdat.supplierRiskMonitor.view.button.dynamicMonitortStuffDef')
            .d('动态监控事件定义')}
        </PermissionButton>
      </Header>
      <Content className={style['page-content']}>
        <div className={style['box-content']}>
          <div className={`${style['row-content']} ${style['row-top']}`}>
            <div className={`${style['risk-tab-panel-left']} ${style['hover-box']}`}>
              <RiskTabPanel canSearch={canSearch} />
            </div>
            <div className={`${style['risk-tab-panel-right']} ${style['hover-box']}`}>
              <AddRiskStuff
                eventsListDs={eventsListDs}
                dispatch={props.dispatch}
                canSearch={canSearch}
              />
            </div>
          </div>
          <div className={`${style['row-content']} ${style['row-bottom']}`}>
            <div className={`${style['org-risk-level']} ${style['hover-box']}`}>
              <OrgRiskLevel canSearch={canSearch} />
            </div>
            <div className={`${style['public-opinion-distribution']} ${style['hover-box']}`}>
              <PublicOpinionDistribution canSearch={canSearch} />
            </div>
            <div className={`${style['latest-public-opinion']} ${style['hover-box']}`}>
              <LatestPublicOpinion
                newsListDs={newsListDs}
                dispatch={props.dispatch}
                canSearch={canSearch}
              />
            </div>
          </div>
        </div>
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['sdat.supplierRiskMonitor'],
})(
  withProps(
    () => {
      const newsListDs = new DataSet({ ...newsListDS() });
      const eventsListDs = new DataSet({ ...eventsListDS() });
      const valueDs = { newsListDs, eventsListDs };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(SupplierRiskMonitorOrg)
);
