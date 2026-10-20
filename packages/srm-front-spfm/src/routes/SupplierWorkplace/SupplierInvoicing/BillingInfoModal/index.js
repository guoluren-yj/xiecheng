/**
 * 开票信息弹窗
 * @Author qingxiang.luo@going-link.com
 * @Date 2022-01-07
 */
import React, { useEffect, useState } from 'react';
import { Modal } from 'choerodon-ui';
import { Form, Button, TextField, Output } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getResponse, getCurrentUser } from 'utils/utils';
import classNames from 'classnames';
import notification from 'utils/notification';
import { queryBillingInfo, saveBillingInfo } from '@/services/supplier/supplierInvoicingService';

import styles from './index.less';

const { Sidebar } = Modal;

const BillingInfoModal = (props) => {
  const {
    visible,
    dataSet,
    localRecord,
    onCancel = () => {},
    isCanEdit = false,
    pageType = 'edit', // edit 编辑保存, renewal 续费, view 查看
    toPay = () => {}, // 前往缴费
  } = props;

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleQueryDetail(localRecord.get('supplierTicketId'));

    return () => {
      dataSet.data = [];
    };
  }, []);

  /**
   * 查询详情信息
   * @param {*} id
   */
  const handleQueryDetail = (id = '') => {
    const params = id ? { supplierTicketId: id } : {};
    queryBillingInfo(params).then((res) => {
      if (getResponse(res)) {
        const obj = res || {};
        dataSet.data = [obj];
      }
    });
  };

  const handleCloseModal = () => {
    dataSet.data = [];
    dataSet.reset();
    onCancel();
  };

  /**
   * 保存数据
   */
  const handleSave = async () => {
    const isValid = await dataSet.current.validate(true, true);
    const isEdit = dataSet.filter(
      (record) => record.status === 'add' || record.status === 'update'
    );

    if (isValid) {
      if (isEdit.length) {
        setLoading(true);
        const data = dataSet.toData()[0];
        saveBillingInfo({
          ...data,
          supplierPaymentId: localRecord.get('supplierPaymentId'),
          userId: getCurrentUser().id,
          userName: getCurrentUser().realName,
        }).then(res => {
          setLoading(false);
          if (getResponse(res)) {
            notification.success();
            handleCloseModal();
          }
        });
      } else {
        handleCloseModal();
      }
    }
  };

  /**
   * 申请开票操作
   */
  const handleSaveApply = async () => {
    const isValid = await dataSet.current.validate(true, true);

    if (isValid) {
      setLoading(true);
      const data = dataSet.toData()[0];
      saveBillingInfo({
        ...data,
        supplierPaymentId: localRecord.get('supplierPaymentId'),
        userId: getCurrentUser().id,
        userName: getCurrentUser().realName,
      }).then((res) => {
        setLoading(false);
        if (getResponse(res)) {
          notification.success();
          handleCloseModal();
        }
      });
    }
  };

  /**
   * 前往缴费
   */
  const handleToPay = async () => {
    const isValid = await dataSet.validate();
    if (isValid) {
      const params = dataSet.toData()[0];
      toPay(params);
    }
  };

  const labelLayout = isCanEdit ? 'float' : 'vertical';
  const FieldType = isCanEdit ? TextField : Output;
  // const SelectField = isCanEdit ? Select : Output;

  return (
    <Sidebar
      title={intl.get('spfm.supplierInvoic.model.billingInformation').d('开票信息')}
      visible={visible}
      closable
      destroyOnClose
      maskClosable={false}
      onCancel={handleCloseModal}
      className={classNames(styles['points-modal-footer'])}
      width={380}
      footer={
        <div>
          {pageType === 'edit' && (
            <Button color="primary" loading={loading} onClick={handleSave}>
              {intl.get(`hzero.common.button.ok`).d('确定')}
            </Button>
          )}
          {pageType === 'view' && (
            <Button color="primary" onClick={handleCloseModal}>
              {intl.get(`hzero.common.button.close`).d('关闭')}
            </Button>
          )}
          {pageType === 'apply' && (
            <Button color="primary" loading={loading} onClick={handleSaveApply}>
              {intl.get(`spfm.supplierInvoic.view.button.applyTicket`).d('申请开票')}
            </Button>
          )}
          {pageType === 'renewal' && (
            <Button color="primary" onClick={handleToPay}>
              {intl.get(`spfm.supplierInvoic.view.button.toPay`).d('前往缴费')}
            </Button>
          )}
          {pageType !== 'view' && (
            <Button onClick={handleCloseModal}>
              {intl.get(`hzero.common.button.cancel`).d('取消')}
            </Button>
          )}
        </div>
      }
    >
      <div className="billing-modal-form">
        <Form labelLayout={labelLayout} dataSet={dataSet} columns={1}>
          {/* <SelectField name="invoiceType" disabled={!isCanEdit} /> */}
          <FieldType name="invoiceTitle" disabled={!isCanEdit} />
          <FieldType name="taxNo" disabled={!isCanEdit} />
          <FieldType name="bankName" disabled={!isCanEdit} />
          <FieldType name="bankAccount" disabled={!isCanEdit} />
          <FieldType name="taxAddress" disabled={!isCanEdit} />
          <FieldType name="taxPhone" disabled={!isCanEdit} />
          <FieldType name="invoicePerson" disabled={!isCanEdit} />
          <FieldType name="invoiceEmaill" disabled={!isCanEdit} />
          <FieldType name="invoicePhone" disabled={!isCanEdit} />
          <FieldType name="invoiceAddress" disabled={!isCanEdit} />
        </Form>
      </div>
    </Sidebar>
  );
};

export default BillingInfoModal;
