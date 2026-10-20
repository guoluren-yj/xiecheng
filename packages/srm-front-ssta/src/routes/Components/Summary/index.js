import React, { Fragment, useMemo } from 'react';
import { Icon, Tooltip } from 'choerodon-ui';
import intl from 'utils/intl';
import { Content } from 'components/Page';
import IMChatDraggable from '_components/IMChatDraggable';
import pin from '@/assets/pin.svg';
import cancelPin from '@/assets/cancel_pin.svg';
import styles from './index.less';

const Index = (props) => {
  const { summaryProps = {} } = props;
  const {
    title = '',
    num = '',
    currencyCode = '',
    taxAmount = '',
    taxIncludedAmount = '',
    netAmount = '',
    desc = '',
    changeFixed,
    totalText = '',
    pinFixed,
    noAmount = false,
    notPub,
    showCardFlag,
    billQuantitySumFlag,
    quantity,
    refundStatus,
    prepaymentRefundAmount,
    associatedPrepaymentAmount,
    refundCompletedPreAmount,
    origPrepaymentAmount,
    sumRefundCompletedAmount,
    cardCode,
    cardRequestBody,
  } = summaryProps;

  function changeClick() {
    if (changeFixed) {
      changeFixed();
    }
  }

  const titleHeader = useMemo(() => {
    if (refundStatus === 'REFUND') {
      return `${num} - ${title}  ${currencyCode} ${intl.get('ssta.common.view.message.refundAmount').d('本次退款金额')} ${prepaymentRefundAmount}`;
    } else {
      return `${num} - ${title}  ${currencyCode} ${taxIncludedAmount}`;
    }
  }, [num, title, currencyCode, prepaymentRefundAmount, taxIncludedAmount, refundStatus]);

  if (showCardFlag === 2) return null;
  return (
    <Fragment>
      <div
        className={`amount-summary-notfix-content-wrapper ${pinFixed && 'fixed-content-wrapper'} ${
          pinFixed && styles['fixed-wrapper']
        }`}
      >
        <Content>
          <div
            className={`${styles['ssta-header']} ${!showCardFlag && styles['ssta-header-no-card']}`}
          >
            <div className={styles['ssta-show-title']}>
              <h3 className={styles['ssta-form-title']}>
                {
                  cardCode ? (
                    <div style={{display: 'flex'}}>
                      <IMChatDraggable
                        cardCode={cardCode}
                        icon="baseline-drag_indicator"
                        tooltip=""
                        requestBody={cardRequestBody}
                        dragText={`${intl.get('ssta.common.view.title.settleNum').d('结算单编号')}${num}`}
                        showDetail
                      />
                      {titleHeader}
                    </div>
                  ) : (<span>{titleHeader}</span>)
                }
              </h3>
              {billQuantitySumFlag === 1 && (
                <div className={styles['ssta-show-quanity']}>
                  {intl.get('ssta.common.model.common.quantity').d('数量')}: {quantity}
                </div>
              )}
            </div>
            {notPub && (
              <div className={styles['ssta-pin']} onClick={changeClick}>
                <img src={pinFixed ? pin : cancelPin} className={styles['push-pin']} alt="" />
                {pinFixed
                  ? intl.get('ssta.common.view.message.cancelPin').d('取消钉住')
                  : intl.get('ssta.common.view.message.onTheTop').d('钉在顶部')}
              </div>
            )}
          </div>
          {Boolean(showCardFlag) && (
            <div className={`${styles.summary} ${noAmount ? styles.noamount_summary : ''}`}>
              <div className={styles.title}>
                <Tooltip title={desc}>{desc}</Tooltip>
              </div>
              <div className={`${styles.detail} ${noAmount ? styles.noamount_detail : ''}`}>
                {/* 退款展示 */}
                {
                  refundStatus === 'REFUND' && (
                    <div className={styles.total}>
                      <div>
                        <Icon type="class" className={styles['class-icon']} />&nbsp;
                        {intl.get('ssta.common.view.message.refundPrePaymentAmount').d('被退款预付款申请金额')}&nbsp;
                      </div>
                      <div>{associatedPrepaymentAmount}</div>&nbsp;-&nbsp;
                      {intl.get('ssta.common.view.message.refundAmount').d('本次退款金额')}&nbsp;
                      <div>{prepaymentRefundAmount}</div>&nbsp;=&nbsp;
                      {intl.get('ssta.common.view.message.afterRefundPrePaymentAmount').d('退款后预付款申请金额')}&nbsp;
                      <div>{refundCompletedPreAmount}</div>
                    </div>
                  )
                }
                {
                  refundStatus === 'BE_REFUNDED' && (
                    <div className={styles.total}>
                      <div>
                        <Icon type="class" className={styles['class-icon']} />&nbsp;
                        {intl.get('ssta.common.view.message.prePaymentApplyAmount').d('预付款申请金额')}&nbsp;
                      </div>
                      <div>{taxIncludedAmount}</div>&nbsp;=&nbsp;
                      {intl.get('ssta.common.view.message.origPrepaymentAmount').d('原始预付款申请金额')}&nbsp;
                      <div>{origPrepaymentAmount}</div>&nbsp;-&nbsp;
                      {intl.get('ssta.common.view.message.sumRefundCompletedAmount').d('累计退款完成金额')}&nbsp;
                      <div>{sumRefundCompletedAmount}</div>
                    </div>
                  )
                }
                {
                  !['REFUND', 'BE_REFUNDED'].includes(refundStatus) && (
                    <div className={styles.total}>
                      <div>
                        <Icon type="class" className={styles['class-icon']} />
                        {totalText}
                      </div>
                      <div>{taxIncludedAmount}</div>
                    </div>
                  )
                }
                {!noAmount && (
                  <div className={styles['detail-amount']}>
                    <div>
                      {intl.get('ssta.common.view.TaxExcluded').d('不含税')}：{netAmount}
                    </div>
                    <div>
                      {intl.get('ssta.common.view.message.TaxAamount').d('税额')}：{taxAmount}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Content>
        {pinFixed && <div style={{ height: '8px', background: '#f4f5f7' }} />}
      </div>
    </Fragment>
  );
};
export default Index;
