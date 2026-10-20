import React, { useContext, Fragment } from 'react';
import { Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';

import { Store } from '../../stores';
import AmountCard from './AmountCard';
import styles from './index.less';


const AmountSummary = observer(() => {
  const { headerDs } = useContext(Store);

  const {
    balPayAmount, // 本次汇总付款金额
    balEnablePayAmount, // 可汇总付款金额
    balEnableApplyAmount, // 可汇总核销金额
    balApplyAmount, // 本次汇总核销金额
    balRemainPayAmount, // 剩余汇总付款金额
    balRemainApplyAmount, // 剩余汇总核销金额
    financialPrecision,
  } = headerDs.current?.get([
    'balPayAmount',
    'balEnablePayAmount',
    'balEnableApplyAmount',
    'balApplyAmount',
    'balRemainPayAmount',
    'balRemainApplyAmount',
    'financialPrecision',
  ]) || {};

  const payAreaShowFlag = !math.eq(balEnablePayAmount, 0);
  const applyAreaShowFlag = !math.eq(balEnableApplyAmount, 0);

  return (
    <Fragment>
      {payAreaShowFlag && (
        <div className={styles['amount-summary-wrapper']}>
          <div className="settle-document-type" style={{ backgroundColor: '#47B881' }}>
            <span className="document-type-name">
              <Tooltip title={intl.get('sbsm.fundPlan.view.title.payment').d('付款')}>
                {intl.get('sbsm.fundPlan.view.title.payment').d('付款')}
              </Tooltip>
            </span>
          </div>
          <div className="amount-content">
            <div className="amount-row">
              <AmountCard
                col="2"
                noDetail
                iconType="request_page"
                iconColor="#FCA000"
                title={intl.get('sbsm.fundPlan.view.title.thisSumPaymentAmount').d('本次汇总付款金额')}
                taxIncludedAmount={balPayAmount}
                financialPrecision={financialPrecision}
              />
              <div className="amount-sign">=</div>
              <AmountCard
                col="2"
                noDetail
                iconType="test_chart"
                iconColor="#47B881"
                title={intl.get('sbsm.fundPlan.view.title.canSumPaymentAmount').d('可汇总付款金额')}
                taxIncludedAmount={balEnablePayAmount}
                financialPrecision={financialPrecision}
              />
              <div className="amount-sign">-</div>
              <AmountCard
                col="2"
                noDetail
                iconType="instance"
                iconColor="#F56349"
                title={intl.get('sbsm.fundPlan.view.title.leftSumPaymentAmount').d('剩余汇总付款金额')}
                taxIncludedAmount={balRemainPayAmount}
                financialPrecision={financialPrecision}
              />
            </div>
          </div>
        </div>
      )}
      {applyAreaShowFlag && (
        <div className={styles['amount-summary-wrapper']}>
          <div className="settle-document-type" style={{ backgroundColor: '#f06202' }}>
            <span className="document-type-name">
              <Tooltip title={intl.get('sbsm.fundPlan.view.title.apply').d('核销')}>
                {intl.get('sbsm.fundPlan.view.title.apply').d('核销')}
              </Tooltip>
            </span>
          </div>
          <div className="amount-content">
            <div className="amount-row">
              <AmountCard
                col="2"
                noDetail
                iconType="request_page"
                iconColor="#FCA000"
                title={intl.get('sbsm.fundPlan.view.title.thisSumApplyAmount').d('本次汇总核销金额')}
                taxIncludedAmount={balApplyAmount}
                financialPrecision={financialPrecision}
              />
              <div className="amount-sign">=</div>
              <AmountCard
                col="2"
                noDetail
                iconType="test_chart"
                iconColor="#47B881"
                title={intl.get('sbsm.fundPlan.view.title.canSumApplyAmount').d('可汇总核销金额')}
                taxIncludedAmount={balEnableApplyAmount}
                financialPrecision={financialPrecision}
              />
              <div className="amount-sign">-</div>
              <AmountCard
                col="2"
                noDetail
                iconType="instance"
                iconColor="#F56349"
                title={intl.get('sbsm.fundPlan.view.title.leftSumApplyAmount').d('剩余汇总核销金额')}
                taxIncludedAmount={balRemainApplyAmount}
                financialPrecision={financialPrecision}
              />
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
});
export default AmountSummary;
