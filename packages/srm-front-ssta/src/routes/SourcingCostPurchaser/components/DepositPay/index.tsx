import React, { Fragment, useState, useCallback } from 'react';
import { Divider } from 'choerodon-ui';
import { Radio, Spin, Tooltip, Icon, Output } from 'choerodon-ui/pro';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import QuoteDepositPay from './QuoteDepositPay';
import PayStatusConfirm from './PayStatusConfirm';
import styles from './index.less';

type PayMethodType = 'manually' | 'quote';

interface DepositPayProps {
  modal?: any,
  depositRecord: DSRecord | null | undefined,
  okCallback: Function,
  remote?: any,
  dsMap?: any,
  activeKey?: any
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

const DepositPay = (props: DepositPayProps) => {

  const { depositRecord, remote } = props;
  const [payMethod, setPayMethod] = useState<PayMethodType>('manually');

  const handleChangePayMethod = useCallback((value) => {
    setPayMethod(value);
  }, []);

  if (!depositRecord) return <Spin />;
  const remoteVisable = remote ? remote.process('SSTA.SOURCING_COST_PUR_CUX.DEPOSIT_MODAL_FORM_TOP_VISABLED', true) : true;

  // 金额卡片埋点
  const getAmountCards = (cardDom: any, otherProps: any) => {
    return remote ? remote.process('SSTA.SOURCING_COST_PUR_CUX.DEPOSIT_MODAL_FORM_AMOUNT_CARDS', cardDom, otherProps) : cardDom
  };

  // Radio隐藏埋点 radio的value勿随意变更
  const getPayRadio = (radioDom: any, otherProps: any) => {
    const showFlag = depositRecord.get('depositToDepositEnableRule') === '1';
    const dom = remote ? remote.process('SSTA.SOURCING_COST_PUR_CUX.DEPOSIT_MODAL_FORM_PAY_METHOD_RADIOS', radioDom, otherProps) : radioDom; // 大全埋点
    if (showFlag) return dom;
    return null;
  };
  
  return (
    <Fragment>
      {remoteVisable &&
        <div>
          <div className={styles['ssta-deposit-pay-summary-row']}>
            {
              getAmountCards(
                (
                  <>
                  <AmountCard name="remainingPaymentAmount" record={depositRecord} />
                  <div className="amount-sign">=</div>
                  <AmountCard name="amount" record={depositRecord} />
                  <div className="amount-sign">-</div>
                  <AmountCard name="paidAmount" record={depositRecord} />
                  </>
                ),
                {
                  card: AmountCard,
                  otherProps: props,
                }
              )
            }
          </div>
          <Divider style={{ margin: '16px 0' }} />
          <div className={styles['ssta-radio-wrap-depositPay']}>
            {
              getPayRadio(
                (
                  [
                    <Radio
                      name="payMethod"
                      value="manually"
                      checked={payMethod === 'manually'}
                      onChange={handleChangePayMethod}
                    >
                      {intl.get('ssta.sourcingCost.view.title.payStatusConfirm').d('缴纳状态确认')}
                    </Radio>,
                    <Radio
                      name="payMethod"
                      value="quote"
                      checked={payMethod === 'quote'}
                      onChange={handleChangePayMethod}
                    >
                      {intl.get('ssta.sourcingCost.view.title.quoteDepositPayConfirm').d('引用保证金缴纳确认')}
                    </Radio>
                  ]
                ),
                { otherProps: props }
              )
            }
          
          </div>
        </div>
      }
      {payMethod === 'manually' && <PayStatusConfirm {...props} />}
      {payMethod === 'quote' && <QuoteDepositPay {...props} />}
    </Fragment>
  );
};

export default DepositPay;