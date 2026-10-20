import React, { Fragment, useState, useCallback } from 'react';
import { Divider } from 'choerodon-ui';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import { Radio, Tooltip, Icon, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import QuoteDepositPay from './QuoteDepositPay';
import PayStatusConfirm from './PayStatusConfirm';
import styles from './index.less';

type PayMethodType = 'manually' | 'quote';

interface ServicePayProps {
  modal?: any,
  remote?: any,
  serviceRecord: DSRecord | undefined,
  okCallback: Function,
}

interface AmountCardProps {
  name: string,
  help?: string,
  record: DSRecord | undefined,
}

const AmountCard = observer((props: AmountCardProps) => {
  const { name, help, record } = props;
  const field = record?.dataSet.getField(name);
  const label = field?.get('label') || '-';
  return (
    <div className="amount-card">
      <div className="amount-card-label">
        <span>{label}</span>
        {help && (
          <Tooltip title={help}>
            <Icon type="help" className="amount-card-help" />
          </Tooltip>
        )}
      </div>
      <Output name={name} record={record} className="amount-card-value" />
    </div>
  );
});

const ServicePay = (props: ServicePayProps) => {

  const { serviceRecord } = props;

  const [payMethod, setPayMethod] = useState<PayMethodType>('manually');

  const handleChangePayMethod = useCallback((value) => {
    setPayMethod(value);
  }, []);

  return (
    <Fragment>
      <div className={styles['ssta-service-pay-summary-row']}>
        <AmountCard name="remainingPaymentAmount" record={serviceRecord} />
        <div className="amount-sign">=</div>
        <AmountCard name="amount" record={serviceRecord} />
        <div className="amount-sign">-</div>
        <AmountCard name="paidAmount" record={serviceRecord} />
      </div>
      <Divider style={{ margin: '16px 0' }} />
      <div className={styles['ssta-radio-wrap-servicePay']}>
        <Radio
          name="payMethod"
          value="manually"
          checked={payMethod === 'manually'}
          onChange={handleChangePayMethod}
        >
          {intl.get('ssta.sourcingCost.view.title.payStatusConfirm').d('缴纳状态确认')}
        </Radio>
        <Radio
          name="payMethod"
          value="quote"
          checked={payMethod === 'quote'}
          onChange={handleChangePayMethod}
        >
          {intl.get('ssta.sourcingCost.view.title.quoteDepositPayConfirm').d('引用保证金缴纳确认')}
        </Radio>
      </div>
      {payMethod === 'manually' && <PayStatusConfirm {...props} />}
      {payMethod === 'quote' && <QuoteDepositPay {...props} />}
    </Fragment>
  );
};

export default ServicePay;