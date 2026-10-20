/**
 * 开票信息弹窗
 * @Author qingxiang.luo@going-link.com
 * @Date 2022-01-07
 */
import React, { useEffect, useState } from 'react';
import { Modal } from 'choerodon-ui';
import { Table, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
// import { getResponse } from 'utils/utils';
import classNames from 'classnames';
// import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
// import { HistoryRecordDS, BillingInfoDS } from '@/stores/supplier/supplierInvoicDS';

import BillingInfoModal from '../BillingInfoModal';

import styles from './index.less';

const { Sidebar } = Modal;

const HistoryRecordModal = (props) => {
  const { visible, localRecord, onCancel = () => {}, listDS, billingDS } = props;

  const [historyRecord, setRecord] = useState(null);
  const [showBillingInfo, setShow] = useState(false);
  const [isCanEdit, setCanEdit] = useState(false);
  const [pageType, setPageType] = useState('view');

  useEffect(() => {
    if (localRecord && localRecord.get('coreTenantCode')) {
      listDS.queryParameter = {
        coreTenantCode: localRecord.get('coreTenantCode'),
        supplierTenantCode: localRecord.get('supplierTenantCode'),
        needGroup: true,
        supplierTenantId: localRecord.get('supplierTenantId'),
      };
      listDS.query();
    }

    return () => {
      listDS.data = [];
      listDS.reset();
    };
  }, []);

  const handleCloseModal = () => {
    listDS.data = [];
    listDS.reset();
    onCancel();
  };

  /**
   * 查看开票信息 申请开票
   * @param {*} record
   */
  const handleViewBillMsg = (record, type) => {
    setRecord(record);
    setShow(true);
    setCanEdit(type === 'edit');
    setPageType(type === 'edit' ? 'apply' : 'view');
  };

  const columns = () => {
    return [
      {
        name: 'ticketStateMeaning',
        renderer: ({ record, text }) => {
          const classes =
            record.get('ticketState') === 'UNINVOICED'
              ? 'uninvoiced'
              : record.get('ticketState') === 'INVOICE_TICKET'
              ? 'invoiced'
              : 'invoiceing';
          return text ? <span className={`tag-status ${classes}`}>{text}</span> : '-';
        },
      },
      {
        header: intl.get('hzero.common.button.operator').d('操作'),
        name: 'operator',
        width: 85,
        renderer: ({ record }) => {
          return (
            <span className="action-link">
              {record.get('ticketState') === 'UNINVOICED' && (
                <a onClick={() => this.handleViewBillMsg(record, 'edit')}>
                  {intl.get(`spfm.supplierInvoic.view.button.applyTicket`).d('申请开票')}
                </a>
              )}
              {['INVOICE_TICKET', 'INVOICE_APPLY'].includes(record.get('ticketState')) && (
                <a onClick={() => handleViewBillMsg(record)}>
                  {intl.get(`spfm.supplierInvoic.view.btn.changeEdit`).d('开票信息')}
                </a>
              )}
            </span>
          );
        },
      },
      { name: 'paymentNo', width: 200 },
      { name: 'paymentFee' },
      { name: 'paymentDate' },
      { name: 'startDate' },
      { name: 'endDate' },
    ];
  };

  const handleCancel = () => {
    setRecord(null);
    setShow(false);
    billingDS.data = [];
    billingDS.reset();
  };

  const billingInfoProps = {
    visible: showBillingInfo,
    localRecord: historyRecord,
    dataSet: billingDS,
    isCanEdit,
    pageType,
    onCancel: handleCancel,
  };

  return (
    <Sidebar
      title={intl.get(`spfm.supplierInvoic.button.historyRecord`).d('缴费历史')}
      visible={visible}
      closable
      destroyOnClose
      maskClosable={false}
      onCancel={handleCloseModal}
      className={classNames(styles['points-modal-footer'])}
      width={900}
      footer={
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.close`).d('关闭')}
          </Button>
        </div>
      }
    >
      <>
        <Table dataSet={listDS} columns={columns()} queryBar="none" />
        {showBillingInfo && <BillingInfoModal {...billingInfoProps} />}
      </>
    </Sidebar>
  );
};

export default formatterCollections({
  code: ['spfm.supplierInvoic'],
})(HistoryRecordModal);
