import React, { Fragment, useContext, useState } from 'react';
import { Tooltip, Icon, Button, Output } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import type { StoreValueType } from '../stores';
import { Store } from '../stores';
import { statusTagRender } from '../../../Components/StatusTag';
import { depositRefundProgressRender } from '../../components/DepositRefundProgress';
import styles from '../../index.less';
import { statusLabelTagRender } from '../../utils/render';

interface AmountCardProps {
  name: string,
  help?: string,
}

const AmountCard = observer((props: AmountCardProps) => {
  const { name, help } = props;
  const { depositHeaderDs } = useContext<StoreValueType>(Store);
  const field = depositHeaderDs?.getField(name);
  const label = field?.get('label') || '-';
  const isLongerFlag = label.length > 25;
  return (
    <div className="amount-card">
      <div className="amount-card-label ultra-long">
        <Tooltip title={isLongerFlag ? label : null}>
          <span >{label}</span>
        </Tooltip> 
        {help && (
          <Tooltip title={help}>
            <Icon type="help" className="amount-card-help" />
          </Tooltip>
        )}
      </div>
      <Output name={name} dataSet={depositHeaderDs} className="amount-card-value" />
    </div>
  );
});

const Summary = observer(() => {

  const { modalFlag, depositHeaderDs, remote } = useContext<StoreValueType>(Store);
  const [amountDetailFlag, setAmountDetailFlag] = useState<Boolean>(true);

  // 金额卡片埋点
  const getFirstLineAmountCards = (cardDom: any, otherProps: any) => {
    return remote ? remote.process('SSTA.DEPOSIT_DETAIL_PUR_CUX.HEAD_SUMMARY_FIRST', cardDom, otherProps) : cardDom
  };

  return (
    <Fragment>
      <div className={styles['detail-summary-wrapper']} style={{paddingTop: 0 }}>
        <div className="detail-summary-total" style={{display:'none'}}>
          <div className="detail-summary-total-left">
            <div className="summary-total-amount">
              <Output
                name="amount"
                dataSet={depositHeaderDs}
                renderer={({ text, dataSet, name }) => `${dataSet?.getField(name)?.get('label')}：${text || '-'}`}
              />
              <Output name="currencyCode" dataSet={depositHeaderDs} />
              <Output
                name="depositStatus"
                dataSet={depositHeaderDs}
                renderer={statusTagRender}
              />
            </div>
            <div className="summary-total-status">
              <Output
                name="depositPaymentStatus"
                dataSet={depositHeaderDs}
                renderer={statusLabelTagRender}
              />
              <Output
                name="depositRefundStatus"
                dataSet={depositHeaderDs}
                renderer={() => (
                  <Fragment>
                    <span className="status-label">{depositHeaderDs?.getField('depositRefundStatus')?.get('label')}：</span>
                    {depositRefundProgressRender(depositHeaderDs.current)}
                  </Fragment>
                )}
              />
            </div>
          </div>
          <div className="detail-summary-total-right">
            {amountDetailFlag ? (
              <Button
                funcType={FuncType.link}
                color={ButtonColor.primary}
                onClick={() => setAmountDetailFlag(false)}
              >
                {intl.get('ssta.common.view.button.collapseDetail').d('收起明细')}
                <Icon type="expand_less" />
              </Button>
            ) : (
              <Button
                funcType={FuncType.link}
                color={ButtonColor.primary}
                onClick={() => setAmountDetailFlag(true)}
              >
                {intl.get('ssta.common.view.button.expandDetail').d('展开明细')}
                <Icon type="expand_more" />
              </Button>
            )}
          </div>
        </div>
        {amountDetailFlag && (
          getFirstLineAmountCards((
            <div className="detail-summary-row">
            <AmountCard name="remainingPaymentAmount" />
            <div className="amount-sign">=</div>
            <AmountCard name="amount" />
            <div className="amount-sign">-</div>
            <AmountCard name="paidAmount" />
          </div>
          ),{
            card: AmountCard, record: depositHeaderDs.current, amountDetailFlag
          })
        )}
        {amountDetailFlag && (
          <div className="detail-summary-row">
            <AmountCard name="remainingRefundableAmount" />
            <div className="amount-sign">=</div>
            <AmountCard name="paidAmount" />
            <div className="amount-sign">-</div>
            <AmountCard name="payForServerAmount" />
            <div className="amount-sign">-</div>
            <AmountCard name="returnAmount" />
            <div className="amount-sign">-</div>
            <AmountCard name="payOutAmount" help={intl.get('ssta.sourcingCost.view.help.depositTransferredOtherDepositsAmount').d('保证金转其他保证金金额')} />
          </div>
        )}
      </div>
    </Fragment>
  );
});

export default Summary;