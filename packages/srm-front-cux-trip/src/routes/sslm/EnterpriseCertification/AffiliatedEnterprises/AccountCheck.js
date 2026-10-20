/* AccountCheck - 对公账户打款（二开）
 * @Date: 2022-06-15 21:03:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, TextField, NumberField } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import styles from '../index.less';

const AccountCheck = ({ dataSet, readOnly = false }) => {
  // 携程收款账户信息，固定展示
  const ctripAccountInfo = [
    {
      label: intl.get('sslm.enterpriseCertification.model.remit.ctripAccountName').d('户名'),
      value: '携程计算机技术（上海）有限公司',
    },
    {
      label: intl
        .get('sslm.enterpriseCertification.model.remit.ctripBankBranchName')
        .d('开户行'),
      value: '中国工商银行股份有限公司上海市桂林路支行',
    },
    {
      label: intl.get('sslm.enterpriseCertification.model.remit.ctripBankAccountNum').d('账号'),
      value: '1001294819200067328',
    },
    {
      label: intl.get('sslm.enterpriseCertification.model.remit.cnapsCode').d('联行号'),
      value: '102290029486',
    },
  ];

  return (
    <div>
      <div className={styles['manual-review-title']}>
        <span />
        {intl.get('sslm.enterpriseCertification.view.title.ctripAccount').d('携程账户')}
      </div>
      <div className={styles['ctrip-account-info']}>
        {ctripAccountInfo.map(item => (
          <div className={styles['ctrip-account-info-item']} key={item.label}>
            <span className={styles['ctrip-account-info-label']}>{item.label}：</span>
            <span className={styles['ctrip-account-info-value']}>{item.value}</span>
          </div>
        ))}
      </div>
      <div className={styles['manual-review-title']} style={{ marginTop: '32px' }}>
        <span />
        {intl
          .get('sslm.enterpriseCertification.view.title.supplierPayInfo')
          .d('供应商打款信息')}
      </div>
      <Form dataSet={dataSet} labelLayout="float">
        <TextField name="accountName" disabled />
        <TextField name="bankName" disabled={readOnly} />
        <TextField name="bankBranchName" disabled={readOnly} />
        <TextField name="bankAccountNum" disabled={readOnly} />
        <NumberField name="payAmount" disabled={readOnly} />
      </Form>
    </div>
  );
};

export default AccountCheck;
