/**
 * MonitorOrgPanel: 监控企业
 * @date: 2022-09-02
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useState, useEffect } from 'react';
import intl from 'utils/intl';
import { fetchOrgHeaderMsg } from '@/services/monitorOrgManagementService';
import MonitorBusiness from './MonitorBusiness';

import style from './index.less';

export default function MonitorOrgPanel(props) {
  const { setDs = () => {}, history } = props;
  const [data, setData] = useState({});

  useEffect(() => {
    fetchOrgHeaderMsg().then((res) => {
      if (res) {
        setData(res);
      }
    });
  }, []);

  return (
    <div style={{ padding: '16px 16px 0 16px' }}>
      <div className={style['data-header']}>
        <div className={style['data-box']}>
          <p className={style['data-title']}>
            {intl
              .get('sdat.monitorOrgManagement.monitorOrg.title.monitorOrgAmount')
              .d('监控企业数量')}
          </p>
          <div className={style['data-concrete']}>
            <span className={style['data-item']}>{data?.monitorOrgCount ?? '0'}</span>
            <span className={style['data-suffix']}>
              /&nbsp;{data?.totalMonitorOrg ?? '0'}
              {/* {intl.get('sdat.monitorOrgManagement.monitorOrg.title.amounts').d('个')} */}
            </span>
          </div>
        </div>
        <div className={style['data-box']}>
          <p className={style['data-title']}>
            {intl.get('sdat.monitorOrgManagement.monitorOrg.title.riskScanTime').d('风险扫描次数')}
          </p>
          <div className={style['data-concrete']}>
            <span className={style['data-item']}>{data?.scanTime ?? '0'}</span>
            <span className={style['data-suffix']}>
              /&nbsp;{data?.totalScanTime ?? '0'}
              {/* {intl.get('sdat.monitorOrgManagement.monitorOrg.title.times').d('次')} */}
            </span>
          </div>
        </div>
        {/* <div className={style['data-box']}>
          <p className={style['data-title']}>
            {intl
              .get('sdat.monitorOrgManagement.monitorOrg.title.relationSearchTimes')
              .d('关系查询次数')}
          </p>
          <div className={style['data-concrete']}>
            <span className={style['data-item']}>{data?.relationQueryTime ?? '0'}</span>
            <span className={style['data-suffix']}>
              /&nbsp;{data?.totalRelationQuery ?? '0'}
              {intl.get('sdat.monitorOrgManagement.monitorOrg.title.times').d('次')}
            </span>
          </div>
        </div> */}
        <div className={style['data-box']}>
          <p className={style['data-title']}>
            {intl
              .get('sdat.monitorOrgManagement.monitorOrg.title.relationDigTime')
              .d('关系挖掘次数')}
          </p>
          <div className={style['data-concrete']}>
            <span className={style['data-item']}>{data?.relationDigTime ?? '0'}</span>
            <span className={style['data-suffix']}>
              /&nbsp;{data?.totalRelationDig ?? '0'}
              {/* {intl.get('sdat.monitorOrgManagement.monitorOrg.title.times').d('次')} */}
            </span>
          </div>
        </div>
      </div>
      <MonitorBusiness setDs={setDs} history={history} />
    </div>
  );
}
