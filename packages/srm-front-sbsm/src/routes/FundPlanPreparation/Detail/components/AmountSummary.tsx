import React, { useContext, useMemo, Fragment, useCallback } from 'react';
import { Icon, Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';

import { Store } from '../stores/index';
import styles from '../index.less';
import { formatNumber } from '../../../../utils/utils';

const AmountCard = (props) => {
  const {
    col,
    title,
    iconColor,
    help,
    iconType,
    taxIncludedAmount,
    setTailDiffShow,
    operationType,
    operationFunc,
    operationHelp,
    isInvOnlyTailFlag = false,
    financialPrecision,
  } = props;
  return (
    <div className={`amount-card amount-col-${col}`}>
      <div className="amount-total">
        <div>
          <Icon type={iconType} className="amount-icon" style={{ color: iconColor }} />
          <span className="amount-header">{title}</span>
          {help && (
            <Tooltip title={help}>
              <Icon type="help" />
            </Tooltip>
          )}
          {operationFunc && (
            <Tooltip title={operationHelp}>
              <Icon
                type={operationType}
                onClick={operationFunc}
                className="amount-card-operation-icon"
              />
            </Tooltip>
          )}
        </div>
        <div className="expand-card">
          <span className="amount-header">{formatNumber(taxIncludedAmount, financialPrecision)}</span>
          {setTailDiffShow && !isInvOnlyTailFlag && (
            <Icon type="expand_less" onClick={() => setTailDiffShow(false)} />
          )}
        </div>
      </div>
    </div>
  );
};



const AmountSummary = observer(() => {
  const { headerDs } = useContext(Store);
  const {
    prepPayAmount = 0, // 本次编制付款金额
    prepEnablePayAmount = 0, // 可编制付款金额
    rtnPrepPayAmount = 0, // 退回编制付款金额
    orgPrepPayAmount = 0, // 原始编制付款金额
    prepEnableApplyAmount = 0, // 可编制核销金额
    orgPrepApplyAmount = 0, // 原始编制核销金额
    rtnPrepApplyAmount = 0, // 退回核销金额
    prepApplyAmount = 0, // 本次编制核销金额
    prepRemainPayAmount = 0, // 剩余编制付款金额
    prepRemainApplyAmount = 0, // 剩余编制核销金额
    financialPrecision,
  } = headerDs.current?.get([
    'prepPayAmount',
    'currencyCode',
    'prepNum',
    'prepEnablePayAmount',
    'rtnPrepPayAmount',
    'orgPrepPayAmount',
    'prepEnableApplyAmount',
    'orgPrepApplyAmount',
    'rtnPrepApplyAmount',
    'prepApplyAmount',
    'prepRemainPayAmount',
    'prepRemainApplyAmount',
    'financialPrecision',
  ]) || {};

  const handelPaymentRender = useCallback(() => {
    return (
      <Fragment>
        <AmountCard
          col="2"
          noDetail
          iconType="test_chart"
          iconColor="#47B881"
          title={intl.get('sbsm.common.view.title.canPrePayment').d('可编制付款金额')}
          taxIncludedAmount={prepEnablePayAmount}
          financialPrecision={financialPrecision}
        />
        <div className="amount-sign">-</div>
        <AmountCard
          col="2"
          noDetail
          iconType="instance"
          iconColor="#F56349"
          title={intl.get('sbsm.common.view.title.leftPreAmount').d('剩余编制付款金额')}
          taxIncludedAmount={prepRemainPayAmount}
          financialPrecision={financialPrecision}
        />
      </Fragment>
    );
  }, [prepEnablePayAmount, prepRemainPayAmount, financialPrecision]);

  const handleApplyRender = useCallback(() => {
    return (
      <Fragment>
        <AmountCard
          col="2"
          noDetail
          iconType="test_chart"
          iconColor="#47B881"
          title={intl.get('sbsm.common.view.title.prepEnableApplyAmount').d('可编制核销金额')}
          taxIncludedAmount={prepEnableApplyAmount}
          financialPrecision={financialPrecision}
        />
        <div className="amount-sign">-</div>
        <AmountCard
          col="2"
          noDetail
          iconType="instance"
          iconColor="#F56349"
          title={intl.get('sbsm.common.view.title.leftPreApplyAmount').d('剩余编制核销金额')}
          taxIncludedAmount={prepRemainApplyAmount}
          financialPrecision={financialPrecision}
        />
      </Fragment>
    );
  }, [prepEnableApplyAmount, prepRemainApplyAmount, financialPrecision]);

  const showPayment = useMemo(() => {
    return !math.eq(prepEnablePayAmount, 0) && math.eq(rtnPrepPayAmount, 0);
  }, [prepEnablePayAmount, rtnPrepPayAmount]);

  const showApply = useMemo(() => {
    return !math.eq(prepEnableApplyAmount, 0) && !math.eq(rtnPrepApplyAmount, 0);
  }, [prepEnableApplyAmount, rtnPrepApplyAmount]);

  if (!showPayment && !showApply) return null;

  return (
    <Fragment>
      {
        showPayment && (
          <Fragment>
            <div className={styles['amount-summary-wrapper']}>
              <div className="settle-document-type" style={{ backgroundColor: '#47B881' }}>
                <span className="document-type-name">
                  <Tooltip title={intl.get('sbsm.common.view.message.paymentAmount').d('付款')}>
                    {intl.get('sbsm.common.view.message.paymentAmount').d('付款')}
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
                    title={intl.get('sbsm.common.view.title.currentPrePayment').d('本次编制付款金额')}
                    taxIncludedAmount={prepPayAmount}
                    financialPrecision={financialPrecision}
                  />
                  <div className="amount-sign">=</div>
                  {handelPaymentRender()}
                </div>
              </div>
            </div>
            <div className={styles['amount-summary-wrapper']}>
              <div className="settle-document-type" style={{ backgroundColor: '#f06202' }}>
                <span className="document-type-name">
                  <Tooltip title={intl.get('sbsm.common.view.message.applyAmount').d('核销')}>
                    {intl.get('sbsm.common.view.message.applyAmount').d('核销')}
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
                    title={intl.get('sbsm.common.view.title.prepApplyAmount').d('本次编制核销金额')}
                    taxIncludedAmount={prepApplyAmount}
                    financialPrecision={financialPrecision}
                  />
                  <div className="amount-sign">=</div>
                  {handleApplyRender()}
                </div>
              </div>
            </div>
          </Fragment>
        )
      }
      {
        showApply && (
          <Fragment>
            <div className={styles['amount-summary-wrapper']}>
              <div className="settle-document-type" style={{ backgroundColor: '#47B881' }}>
                <span className="document-type-name">
                  <Tooltip title={intl.get('sbsm.common.view.message.paymentAmount').d('付款')}>
                    {intl.get('sbsm.common.view.message.paymentAmount').d('付款')}
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
                    title={intl.get('sbsm.common.view.title.currentPrePayment').d('本次编制付款金额')}
                    taxIncludedAmount={prepPayAmount}
                    financialPrecision={financialPrecision}
                  />
                  <div className="amount-sign">=</div>
                  <AmountCard
                    col="2"
                    noDetail
                    iconType="test_chart"
                    iconColor="#47B881"
                    title={intl.get('sbsm.common.view.title.orgPrepPayAmount').d('原始编制付款金额')}
                    taxIncludedAmount={orgPrepPayAmount}
                    financialPrecision={financialPrecision}
                  />
                  <div className="amount-sign">-</div>
                  <AmountCard
                    col="2"
                    noDetail
                    iconType="instance"
                    iconColor="#F56349"
                    title={intl.get('sbsm.common.view.title.rtnPrepPayAmount').d('退回付款金额')}
                    taxIncludedAmount={rtnPrepPayAmount}
                    financialPrecision={financialPrecision}
                  />
                  <div className="amount-sign">=</div>
                  {handelPaymentRender()}
                </div>
              </div>
            </div>
            <div className={styles['amount-summary-wrapper']}>
              <div className="settle-document-type" style={{ backgroundColor: '#f06202' }}>
                <span className="document-type-name">
                  <Tooltip title={intl.get('sbsm.common.view.message.applyAmount').d('核销')}>
                    {intl.get('sbsm.common.view.message.applyAmount').d('核销')}
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
                    title={intl.get('sbsm.common.view.title.prepApplyAmount').d('本次编制核销金额')}
                    taxIncludedAmount={prepApplyAmount}
                    financialPrecision={financialPrecision}
                  />
                  <div className="amount-sign">=</div>
                  <AmountCard
                    col="2"
                    noDetail
                    iconType="test_chart"
                    iconColor="#47B881"
                    title={intl.get('sbsm.common.view.title.canPrePayment').d('原始编制核销金额')}
                    taxIncludedAmount={orgPrepApplyAmount}
                    financialPrecision={financialPrecision}
                  />
                  <div className="amount-sign">-</div>
                  <AmountCard
                    col="2"
                    noDetail
                    iconType="instance"
                    iconColor="#F56349"
                    title={intl.get('sbsm.common.view.title.leftPreAmount').d('退回核销金额')}
                    taxIncludedAmount={rtnPrepApplyAmount}
                    financialPrecision={financialPrecision}
                  />
                  <div className="amount-sign">=</div>
                  {handleApplyRender()}
                </div>
              </div>
            </div>
          </Fragment>
        )
      }
    </Fragment>
  );

});
export default AmountSummary;
