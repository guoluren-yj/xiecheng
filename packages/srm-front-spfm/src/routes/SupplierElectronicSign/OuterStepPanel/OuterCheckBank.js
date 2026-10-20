import React, { useMemo, useEffect, useState } from 'react';
import { DataSet, Form, Output } from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { fetchBankInfo } from '@/services/supplierElecSignWorkplaceService';

import { BankFormDS } from '../stores/supplierSignDS';

import styles from './index.less';

export default function OuterCheckBank({ companyDetail, authType, tenantId }) {
  const bankFormDS = useMemo(() => new DataSet({ ...BankFormDS() }), []);

  const [bankInfo, setBankInfo] = useState({});

  useEffect(() => {
    if (!companyDetail) return;
    fetchBankInfo({
      ...companyDetail,
      authType,
      tenantId,
    }).then((res) => {
      if (getResponse(res)) {
        bankFormDS.data = [{ ...res }];
        setBankInfo(res);
      }
    });
  }, [companyDetail, authType, tenantId]);

  return (
    <>
      <div className={styles['outer-ca-auth-card-title']}>
        {intl.get('spfm.supplierElectronicSign.view.title.selectPayType').d('请选择打款方式')}
      </div>
      <div style={{ color: '#868D9C', lineHeight: '18px', marginTop: '4px' }}>
        {intl
          .get('spfm.supplierElectronicSign.view.title.payToAccount', { name: bankInfo?.account })
          .d('请向XX账户打款，检测到您公司的打款流水后自动通过认证')}
      </div>
      <div style={{ marginTop: '16px', padding: '20px', backgroundColor: '#F7F8FA' }}>
        <Form dataSet={bankFormDS} columns={4} labelLayout="float">
          <Output name="accountNameEn" />
          <Output name="bankNameEn" />
          <Output name="accountNo" />
          <Output name="switchCode" />
        </Form>

        <Divider dashed style={{}} />

        <div>
          <span style={{ fontSize: '16px', color: '#1D2129', fontWeight: '500' }}>
            {intl.get('spfm.supplierElectronicSign.view.title.payedAmount').d('汇款金额')}
          </span>
          <span
            style={{ marginLeft: '8px', fontSize: '24px', color: '#E64322', fontWeight: '600' }}
          >
            ${bankInfo?.amount ?? 0.01}
          </span>
          <span style={{ color: '#868D9C', marginLeft: '20px', fontSize: '12px' }}>
            {`(${intl
              .get('spfm.supplierElectronicSign.view.message.usedUsd')
              .d('推荐使用美元汇款，其他币种请确保打款本币转换为美元后不低于0.01美元')})`}
          </span>
        </div>
      </div>
      <div style={{ float: 'right', color: '#868D9C', marginTop: '8px' }}>
        {intl
          .get('spfm.supplierElectronicSign.view.message.fieldMsg')
          .d('若审核失败或加急审核，请直接电话联系契约锁工作人员：4008056850')}
      </div>
    </>
  );
}
