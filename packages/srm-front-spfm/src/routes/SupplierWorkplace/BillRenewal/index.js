import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { Button } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { getResponse, getCurrentUser } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import cuxRemote from 'hzero-front/lib/utils/remote';
import {
  beforeGenerate,
  cancelPay,
  checkAlreadyPay,
} from '@/services/supplier/supplierInvoicingService';

import payGuideImg from '@/assets/pay_guide_bg.png';

import './index.less';

const BillRenewal = props => {
  const { remote } = props;
  const [paymentData, setPayData] = useState({});

  useEffect(() => {
    const payData = getCurrentUser().paymentData || {};
    setPayData({
      ...payData,
      paymentFee: payData.paymentFee >= 0 ? payData.paymentFee.toFixed(2) : '0.00',
    });
  }, []);

  /**
   * 前往缴费
   */
  const handleToPay = () => {
    const { supplierPaymentId = '' } = paymentData;
    if (supplierPaymentId) {
      handlePay(supplierPaymentId);
    }
  };

  const handlePay = supplierPaymentId => {
    const { host = '', protocol = '' } = document.location;

    beforeGenerate({
      supplierPaymentId,
      returnUrl: protocol && host ? `${protocol}//${host}/app` : '',
    }).then(res => {
      if (res && typeof res === 'string' && !res.includes('failed')) {
        props.history.push(
          `/pub/spct/payment-cashier-plateform?payBusinessType=SUPPLIER_PAY&paymentOrderNum=${res}`
        );
      } else {
        const params = JSON.parse(res);
        if (params.code || params.message) {
          notification.error({
            message: params.message,
          });
        }
      }
    });
  };

  /**
   * 缴费中
   */
  const handlePaying = () => {
    if (paymentData.payUserId === getCurrentUser().id) {
      // 当前用户等于付款用户
      handleToPay();
    } else {
      const { supplierPaymentId = '' } = paymentData;
      if (supplierPaymentId) {
        checkAlreadyPay({ supplierPaymentId }).then(result => {
          if (getResponse(result)) {
            handlePay(supplierPaymentId);
          }
        });
      }
    }
  };

  /**
   * 取消缴费
   */
  const handleCancelPay = () => {
    cancelPay({
      supplierPaymentId: paymentData.supplierPaymentId,
    }).then(() => {
      window.location.reload();
    });
  };

  return (
    <div className="content-base-area">
      <div style={{ width: '100%', position: 'relative' }}>
        <img src={payGuideImg} alt="" width="100%" />
        <div className="content-card">
          <div className="content-title">
            {intl.get('spfm.billRenewal.view.title.payGuide').d('平台订阅费缴费指引')}
          </div>
          <div className="content-item-area">
            <span>
              {intl.get('spfm.billRenewal.view.title.pubTime').d('发布时间')}: &nbsp;&nbsp;
              {paymentData?.creationDate?.substring(0, 10) ?? ''}
            </span>
            <span>
              {intl.get('spfm.billRenewal.view.title.pubCompany').d('发布单位')}: &nbsp;&nbsp;
              {intl.get('spfm.billRenewal.view.title.zhenyunComp').d('上海甄云科技')}
            </span>
          </div>
          {remote.render(
            'SPFM_SUPPLIER_WORKPLACE_BILL_RENEWAL_PAGE_CONTENT',
            <>
              <div className="content-detail">
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{' '}
                {intl.get('spfm.billRenewal.view.title.payGuideMsgOrg', {
                  name: paymentData?.coreTenantName ?? '',
                })}
                :
              </div>
              <div className="content-detail-table">
                <div className="content-table-row">
                  <div className="content-table-short-col">
                    {intl.get('spfm.supplierInvoic.model.supplierObj').d('供应商')}
                  </div>
                  <div className="content-table-col">
                    {paymentData?.supplierTenantCode ?? ''}&nbsp;&nbsp;
                    {paymentData?.supplierTenantName ?? ''}
                  </div>
                </div>
                <div className="content-table-row">
                  <div className="content-table-short-col">
                    {intl.get('spfm.supplierInvoic.model.nuclearCompany').d('核企')}
                  </div>
                  <div className="content-table-col">
                    {paymentData?.coreTenantCode ?? ''}&nbsp;&nbsp;
                    {paymentData?.coreTenantName ?? ''}
                  </div>
                </div>
                <div className="content-table-row content-table-row-bottom">
                  <div className="content-table-short-col">
                    {intl.get('spfm.supplierInvoic.model.activePeriod').d('有效期')}
                  </div>
                  <div className="content-table-col">
                    {paymentData?.startDate?.substring(0, 10) ?? ''}
                    &nbsp;&nbsp;
                    {intl.get('spfm.supplierInvoic.view.title.toFlag').d('至')}
                    &nbsp;&nbsp;
                    {paymentData?.endDate?.substring(0, 10) ?? ''}
                  </div>
                </div>
              </div>
            </>,
            { paymentData }
          )}

          <div className="content-detail-footer">
            <span
              style={{
                display: 'inline-block',
                marginRight: '20px',
                lineHeight: '40px',
                verticalAlign: 'middle',
              }}
            >
              <span style={{ fontSize: '14px' }}>
                {intl.get(`spfm.supplierInvoic.model.amount`).d('年订阅费')}
              </span>
              &nbsp;&nbsp;
              <span>
                <span style={{ fontSize: '18px', fontWeight: 600, color: '#F56349' }}>
                  {paymentData.currencyCode || 'CNY'}
                </span>
                <span style={{ fontSize: '24px', fontWeight: 600, color: '#F56349' }}>
                  {paymentData.paymentFee}
                </span>
              </span>
            </span>

            {paymentData.canPay && paymentData.payUserId === getCurrentUser().id && (
              <Button
                style={{ width: '104px', height: '40px', fontSize: '14px' }}
                onClick={handleCancelPay}
              >
                {intl.get('spfm.billRenewal.view.button.calcelPay').d('取消支付')}
              </Button>
            )}

            {!paymentData.canPay && (
              <Button
                style={{ width: '104px', height: '40px', fontSize: '14px' }}
                color="primary"
                onClick={handlePaying}
              >
                {intl.get('spfm.billRenewal.view.button.payingStatus').d('支付中')}
              </Button>
            )}

            {paymentData.canPay && (
              <Button
                style={{ width: '104px', height: '40px', fontSize: '14px' }}
                color="primary"
                onClick={handleToPay}
              >
                {intl.get('spfm.billRenewal.view.button.toPay').d('前往缴费')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(({ global }) => ({
  global,
}))(
  cuxRemote({
    code: 'SPFM_SUPPLIER_WORKPLACE_BILL_RENEWAL',
    name: 'remote',
  })(
    formatterCollections({
      code: ['spfm.billRenewal', 'spfm.supplierInvoic'],
    })(BillRenewal)
  )
);
