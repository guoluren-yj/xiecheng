import React from 'react';
import intl from 'utils/intl';
import { Form, Output } from 'choerodon-ui/pro';
import ScopePanel from './ScopePanel';

import styles from './index.less';

export default function BasicComp(props) {
  const {
    basicInfoDS,
    localId,
    dispatch,
    monitorWorkbench,
    selectScopeListDS,
    companyLovDS,
    selectDS,
  } = props;

  let riskPlanId = '';
  if (basicInfoDS && basicInfoDS.current) {
    riskPlanId = basicInfoDS.current.get('riskPlanId') || '';
  }

  return (
    <>
      <div className={styles['risk-scan-config-edit-detail-basic-info']} style={{ flex: 1 }}>
        <div className={styles['risk-scan-config-edit-card-title']}>
          {intl.get('sdat.riskScanConfig.view.title.basicInfo').d('基础信息')}
        </div>
        <div style={{ marginTop: '16px' }}>
          <Form dataSet={basicInfoDS} columns={3} labelLayout="float">
            <Output name="planNumber" disabled={riskPlanId} addonBefore="Mon_" />
            <Output name="planName" />
            <Output name="planCompanyType" disabled={riskPlanId} />
            <Output name="chargeList" />
            <Output name="stakeholderList" />
            <Output name="notifyFlag" />
          </Form>
        </div>

        <div className={styles['risk-scan-config-edit-card-title']} style={{ marginTop: '32px' }}>
          {intl.get('sdat.riskScanConfig.view.title.scope').d('适用范围')}
        </div>
        <ScopePanel
          localId={localId}
          dispatch={dispatch}
          monitorWorkbench={monitorWorkbench}
          selectScopeListDS={selectScopeListDS}
          companyLovDS={companyLovDS}
          selectDS={selectDS}
        />
      </div>
    </>
  );
}
