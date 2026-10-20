/**
 * MonitorDetail：监控的详情组件
 * @date: 2022-09-13
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React from 'react';
// import { Icon, Result } from 'choerodon-ui';
// import intl from 'utils/intl';

import MonitorBusiness from './MonitorBusiness';

// import style from './index.less';

export default function MonitorDetail(props = {}) {
  const { selectRecord, setDs = () => {} } = props;

  return (
    <>
      {/* <div className={style['data-header']}>
        <div className={style['data-box']}>
          <p className={style['data-title']}>
            {intl
              .get('sdat.monitorOrgManagement.monitorStuff.title.monitorOrgAmount')
              .d('监控企业数量')}
          </p>
          <div className={style['data-concrete']}>
            <span className={style['data-item']}>{selectRecord?.monitorNum ?? '-'}</span>
            <span className={style['data-suffix']}>
              {intl.get('sdat.monitorOrgManagement.monitorStuff.title.amounts').d('个')}
            </span>
          </div>
        </div>
        <div className={style['data-box']}>
          <p className={style['data-title']}>
            {intl
              .get('sdat.monitorOrgManagement.monitorStuff.title.riskScanTime')
              .d('风险扫描次数')}
          </p>
          <div className={style['data-concrete']}>
            <span className={style['data-item']}>{selectRecord?.riskScanNum ?? '-'}</span>
            <span className={style['data-suffix']}>
              {intl.get('sdat.monitorOrgManagement.monitorStuff.title.times').d('次')}
            </span>
          </div>
        </div>
      </div> */}
      <MonitorBusiness selectRecord={selectRecord} setDs={setDs} />
    </>
  );
}
