import React, { Fragment, useEffect } from 'react';
import { Divider } from 'choerodon-ui';
import { Spin, Tooltip, Icon, Output } from 'choerodon-ui/pro';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import { observer } from 'mobx-react';

import PayStatusConfirm from './PayStatusConfirm';
import styles from './index.less';

interface DepositPayProps {
  modal?: any,
  depositRecord: DSRecord | null | undefined,
  okCallback: Function,
  remote?: any,
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

  if (!depositRecord) return <Spin />;

  const remoteVisable = remote ? remote.process('SSTA.DEPOSIT_DETAIL_SUP_CUX.DEPOSIT_MODAL_FORM_TOP_VISABLED', true) : true;

  // 金额卡片埋点
  const getAmountCards = (cardDom: any, otherProps: any) => {
    return remote ? remote.process('SSTA.SOURCING_COST_SUP_CUX.DEPOSIT_MODAL_FORM_AMOUNT_CARDS', cardDom, otherProps) : cardDom
  };

  return (
    <Fragment>
      {remoteVisable &&
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
      }
      {remoteVisable && <Divider style={{ margin: '16px 0' }} />}
      <PayStatusConfirm {...props} />
    </Fragment>
  );
};

export default DepositPay;