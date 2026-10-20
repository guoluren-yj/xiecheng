/**
 * 风险监控卡片
 * @date: 2022-09-16
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useState } from 'react';
import { DataSet, Tooltip, Modal, Table } from 'choerodon-ui/pro';
import { Timeline } from 'choerodon-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { getSession } from 'utils/utils';
import { routerRedux } from 'dva/router';
import qs from 'querystring';
import style from './Cards.less';

const SRM_AMBN = '/ambn';
const {
  crmSignature = '8a8d7ac4-4fba-4db8-aa71-44213f23b096',
  crmTenant = '30',
  crmTenantId = '30',
  crmUserId = '495737',
  tenantId = '520',
  clientCode = 'DEV_CLIENT',
} = getSession('MESSAGE') || {};
const header = crmSignature ? { 'ambn-client-signature': `${crmSignature}` } : {};
const passParams = {
  client: clientCode,
  tenant: crmTenantId,
  useTenant: crmTenant,
  userId: crmUserId,
  tenantId,
};
const { Column } = Table;

function RiskMonitor(props = {}) {
  const { eventsListDs, detailListDs } = props.valueDs;

  const [dataList, setDataList] = useState([]);

  React.useEffect(() => {
    // 查询事件
    eventsListDs.pageSize = 20;
    eventsListDs.query(1, { page: 0, pageSize: 20 }).then(res => {
      if (res?.content) setDataList(res?.content ?? []);
    });
  }, []);

  /**
   * renderStuffsList : 渲染列表
   */
  const renderStuffsList = React.useMemo(() => {
    return (dataList || []).map(item => {
      const { updateNum = 0, updateDay = '--:--:--' } = item || {};
      const text = `${intl
        .get('spfm.dashboard.supplierRiskMonitor.view.title.dynamicMonitor')
        .d('【动态监控】')}${intl
        .get('spfm.dashboard.supplierRiskMonitor.view.title.inThisMonitorPeriod')
        .d('本监控周期内')}${updateNum}${intl
        .get('spfm.dashboard.supplierRiskMonitor.view.title.organizations')
        .d('家企业')}${intl
        .get('spfm.dashboard.supplierRiskMonitor.view.title.hasUpdatedStuff')
        .d('有事件更新，')}${intl
        .get('spfm.dashboard.supplierRiskMonitor.view.title.pleaseFocus')
        .d('请及时关注！')}`;
      const passTime = `${updateDay} 00:00:00`; // 传参需要的时间参数

      return (
        <Timeline.Item color="gray">
          <div
            className={style['riskmonitor-risk-line']}
            onClick={() => {
              handleTextClick(updateDay, passTime, updateNum);
            }}
          >
            <Tooltip placement="top" title={text} className={style['riskmonitor-risk-text']}>
              {text}
            </Tooltip>
            <div className={style['riskmonitor-risk-calendar']}>{updateDay}</div>
          </div>
        </Timeline.Item>
      );
    });
  }, [dataList]);

  const handleTextClick = (updateDay, passTime, updateNum) => {
    if (!passTime) return;
    detailListDs.setQueryParameter('startDate', passTime);
    detailListDs.query();
    Modal.open({
      title: intl.get('spfm.dashboard.supplierRiskMonitor.view.title.newsDetail').d('消息详情'),
      style: { width: '700px' },
      footer: () => null,
      closable: true,
      children: (
        <div className={style['riskmonitor-modal-box']}>
          <div className={style['riskmonitor-modal-title']}>
            {intl.get('spfm.dashboard.supplierRiskMonitor.title.riskDaily').d('风险动态监控日报')}
            <span>{updateDay}</span>
          </div>
          <p>
            {`${intl
              .get('spfm.dashboard.supplierRiskMonitor.view.title.inThisMonitorPeriod')
              .d('本监控周期内')}${updateNum}${intl
              .get('spfm.dashboard.supplierRiskMonitor.view.title.organizations')
              .d('家企业')}${intl
              .get('spfm.dashboard.supplierRiskMonitor.view.title.hasUpdatedStuff')
              .d('有事件更新，')}${intl
              .get('spfm.dashboard.supplierRiskMonitor.view.title.checkTheList')
              .d('详情查看下表')}`}
          </p>
          <Table dataSet={detailListDs}>
            <Column name="socialCode" width={150} />
            <Column name="enterpriseName" width={150} />
            <Column name="dimensionDetail" />
            <Column
              name="riskMonitor"
              width={150}
              renderer={({ record }) => (
                <a
                  onClick={() => {
                    handleSkipPage(record?.get('socialCode'));
                  }}
                >
                  {intl.get('spfm.dashboard.supplierRiskMonitor.view.button.check').d('查看')}
                </a>
              )}
            />
          </Table>
          <p>
            {intl
              .get('spfm.dashboard.supplierRiskMonitor.explain.pleaseFoucus')
              .d('以上情况请及时关注！')}
          </p>
        </div>
      ),
    });
  };

  /**
   * handleSkipPage: 跳转监控事件页面
   * @param {*} socialCode
   * @returns
   */
  const handleSkipPage = socialCode => {
    if (!socialCode) return;
    props.dispatch(
      routerRedux.push({
        pathname: '/spfm/monitor-stuff',
        search: qs.stringify({
          socialCode,
        }),
      })
    );
  };

  return (
    <div className={style['riskmonitor-out-box']}>
      <div className={style['riskmonitor-title-bar']}>
        <div className={style['riskmonitor-title-div']}>
          {intl.get('spfm.dashboard.supplierRiskMonitor.view.title.riskDaily').d('风控日报')}
        </div>
      </div>
      <div className={style['riskmonitor-content-bar']}>
        {(dataList || []).length !== 0 ? (
          <Timeline>{renderStuffsList}</Timeline>
        ) : (
          <>{intl.get('spfm.dashboard.supplierRiskMonitor.view.title.nodata').d('暂无数据')}</>
        )}
      </div>
    </div>
  );
}

export default formatterCollections({
  code: ['spfm.dashboard'],
})(
  withProps(
    () => {
      const eventsListDs = new DataSet({
        autoQuery: false,
        autoCreate: false,
        fields: [],
        transport: {
          read: ({ data, params }) => {
            return {
              url: `${SRM_AMBN}/v1/${tenantId}/monitor-enterprise/monitor-notice-list`,
              params: {
                ...data,
                ...params,
                ...passParams,
              },
              headers: { ...header },
              method: 'GET',
            };
          },
        },
      });

      const detailListDs = new DataSet({
        autoQuery: false,
        selection: false,
        autoCreate: false,
        fields: [
          {
            name: 'socialCode',
            label: intl
              .get('spfm.dashboard.supplierRiskMonitor.model.view.socialCode')
              .d('统一社会信用代码'),
          },
          {
            name: 'enterpriseName',
            label: intl
              .get('spfm.dashboard.supplierRiskMonitor.model.view.enterpriseName')
              .d('企业名称'),
          },
          {
            name: 'dimensionDetail',
            label: intl
              .get('spfm.dashboard.supplierRiskMonitor.model.view.dimensionDetail')
              .d('事件更新'),
          },
          {
            name: 'riskMonitor',
            label: intl
              .get('spfm.dashboard.supplierRiskMonitor.model.view.riskMonitor')
              .d('风险动态监控'),
          },
        ],
        transport: {
          read: ({ data, params }) => {
            return {
              url: `${SRM_AMBN}/v1/${tenantId}/monitor-enterprise/monitor-notice-detail`,
              params: {
                ...data,
                ...params,
                ...passParams,
              },
              headers: { ...header },
              method: 'GET',
            };
          },
        },
      });

      const valueDs = { eventsListDs, detailListDs };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(RiskMonitor)
);
