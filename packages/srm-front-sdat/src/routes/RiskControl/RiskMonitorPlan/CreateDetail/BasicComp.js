import React from 'react';
import intl from 'utils/intl';
import { Form, TextField, Lov, Select, IntlField } from 'choerodon-ui/pro';

import styles from './index.less';

export default function BasicComp(props) {
  const { basicInfoDS } = props;

  let riskPlanId = '';
  if (basicInfoDS && basicInfoDS.current) {
    riskPlanId = basicInfoDS.current.get('riskPlanId') || '';
  }

  return (
    <>
      <div className={styles['risk-scan-config-edit-detail-basic-info']}>
        <div className={styles['risk-scan-config-edit-card-title']}>
          {intl.get('sdat.riskScanConfig.view.title.basicInfo').d('基础信息')}
        </div>
        <div style={{ marginTop: '16px' }}>
          <Form dataSet={basicInfoDS} columns={3} labelLayout="float">
            <TextField name="planNumber" disabled={riskPlanId} addonBefore="Mon_" />
            <IntlField name="planName" />
            <Select name="planCompanyType" disabled={riskPlanId} />
            <Lov name="chargeList" />
            <Lov name="stakeholderList" />
            <Select name="notifyFlag" />
          </Form>
        </div>
      </div>
    </>
  );
}
