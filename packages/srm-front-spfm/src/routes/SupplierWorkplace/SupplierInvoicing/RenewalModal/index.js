/**
 * 发票信息弹窗
 * @Author qingxiang.luo@going-link.com
 * @Date 2022-01-07
 */
import React, { useEffect, useState } from 'react';
import { Modal, Icon } from 'choerodon-ui';
import { Form, Button, Output } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentUser } from 'utils/utils';
import classNames from 'classnames';
import formatterCollections from 'utils/intl/formatterCollections';
import { queryPaymentInfo, cancelPay } from '@/services/supplier/supplierInvoicingService';

import BillingInfoModal from '../BillingInfoModal';
import styles from './index.less';

const { Sidebar } = Modal;

const RenewalModal = props => {
  const {
    visible,
    localRecord,
    onCancel = () => {},
    dataSet,
    billingDS,
    onPay = () => {},
    onCheckReady = () => {},
  } = props;

  const [showBillingInfo, setShow] = useState(false);
  const [modalWith, setWidth] = useState(380);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (localRecord && localRecord.get('supplierPaymentId')) {
      handleQueryDetail(localRecord.get('supplierPaymentId'));
    }
  }, []);

  /**
   * 查询账单详情信息
   * @param {*} id
   */
  const handleQueryDetail = id => {
    queryPaymentInfo({ supplierPaymentId: id }).then(res => {
      if (getResponse(res)) {
        const obj = res || {};
        setFormData(obj);
        dataSet.data = [
          {
            ...obj,
            paymentFee: `CNY ${res.paymentFee > 0 ? res.paymentFee.toFixed(2) : 0.0}`,
            activePeriod:
              res.startDate || res.endDate
                ? `${res.startDate ? res.startDate.substring(0, 10) : ''} ${intl
                    .get('spfm.supplierInvoic.view.title.toFlag')
                    .d('至')} ${res.endDate ? res.endDate.substring(0, 10) : ''}`
                : null,
          },
        ];
      }
    });
  };

  const handleCloseModal = () => {
    dataSet.data = [];
    dataSet.reset();
    onCancel();
  };

  /**
   * 前往缴费
   */
  const handleToPay = () => {
    const { supplierPaymentId = '' } = dataSet.toData()[0] || {};
    if (onPay && typeof onPay === 'function' && supplierPaymentId) {
      onPay(supplierPaymentId);
    }
  };

  const handleCancel = () => {
    setShow(false);
    setWidth(380);
    billingDS.data = [];
    billingDS.reset();
  };

  /**
   * 缴费中
   */
  const handlePaying = () => {
    if (formData.payUserId === getCurrentUser().id) {
      // 当前用户等于付款用户
      handleToPay();
    } else {
      const { supplierPaymentId = '' } = dataSet.toData()[0] || {};
      if (supplierPaymentId) {
        onCheckReady(supplierPaymentId);
      }
    }
  };

  /**
   * 取消缴费
   */
  const handleCancelPay = () => {
    const supplierPaymentId = dataSet?.current?.get('supplierPaymentId') ?? '';
    cancelPay({
      supplierPaymentId,
    }).then(res => {
      if (getResponse(res)) {
        notification.success();
        handleQueryDetail(supplierPaymentId);
      }
    });
  };

  const billingInfoProps = {
    visible: showBillingInfo,
    localRecord,
    dataSet: billingDS,
    isCanEdit: false,
    pageType: 'renewal',
    toPay: handleToPay,
    onCancel: handleCancel,
  };

  return (
    <Sidebar
      title={intl.get('spfm.supplierInvoic.model.renewalBill').d('续费账单')}
      visible={visible}
      closable
      destroyOnClose
      maskClosable={false}
      onCancel={handleCloseModal}
      className={classNames(styles['renewal-modal-footer'])}
      width={modalWith}
      footer={
        <div>
          {formData.canPay && (
            <Button color="primary" onClick={handleToPay}>
              {intl.get(`spfm.supplierInvoic.view.button.toPay`).d('前往缴费')}
            </Button>
          )}
          {!formData.canPay && (
            <Button color="primary" onClick={handlePaying}>
              {intl.get('spfm.supplierInvoic.view.button.payingStatus').d('支付中')}
            </Button>
          )}

          {formData.canPay && formData.payUserId === getCurrentUser().id && (
            <Button onClick={handleCancelPay}>
              {intl.get('spfm.supplierInvoic.view.button.calcelPay').d('取消支付')}
            </Button>
          )}
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      }
    >
      <>
        <div className="renewal-modal-panel">
          <span>
            <Icon type="help" />
          </span>
          <span style={{ marginLeft: '10px', verticalAlign: 'middle' }}>
            {intl
              .get('spfm.supplierInvoic.view.renewalAlertMsg')
              .d('续费账单如下，请仔细核对账单后确认前往缴费。')}
          </span>
        </div>
        <div className="renewal-modal-form">
          <Form dataSet={dataSet} columns={1} labelLayout="vertical">
            <Output name="coreTenantCode" disabled />
            <Output name="coreTenantName" disabled />
            <Output name="supplierTenantName" disabled />
            <Output name="paymentFee" disabled />
            <Output name="activePeriod" disabled />
          </Form>
        </div>
        {showBillingInfo && <BillingInfoModal {...billingInfoProps} />}
      </>
    </Sidebar>
  );
};

export default formatterCollections({
  code: ['spfm.supplierInvoic'],
})(RenewalModal);
