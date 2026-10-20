/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */
import React, { useEffect, useState } from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import styles from './index.less';

export default function CompanyAddModal(props) {
  const { businessListDS, itemCode = '', riskPlanId = '' } = props;

  const [refresh, setRefresh] = useState(false);

  const pkgTypeMap = {
    CreditRisk: 'MONITOR_CREDIT_PKG',
    BusinessRisk: 'MONITOR_BUSINESS_PKG',
    DisasterRisk: 'MONITOR_DISASTER_PKG',
  };

  useEffect(() => {
    if (itemCode) {
      businessListDS.setQueryParameter('pkgType', pkgTypeMap[itemCode]);
      businessListDS.setQueryParameter('riskPlanId', riskPlanId);
      businessListDS.query();
    }
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const classMap = {
    0: styles['status-disabled'],
    1: styles['status-enabled'],
  };

  const columns = () => {
    return [
      { name: 'companyName' },
      { name: 'socialCode' },
      {
        name: 'effectiveFlag',
        renderer: ({ value }) => {
          const classes = classMap[value];
          return (
            <span className={classes}>
              {value == 0
                ? intl.get('hzero.common.status.invalid').d('失效')
                : intl.get('hzero.common.status.effective').d('有效')}
            </span>
          );
        },
      },
    ];
  };

  return (
    <>
      <Table dataSet={businessListDS} columns={columns()} />
    </>
  );
}
