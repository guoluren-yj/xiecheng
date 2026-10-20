import React, { useState, useMemo } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import classNames from 'classnames';
import { withRouter } from 'react-router-dom';

import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import c7nModal from '@/utils/c7nModal';
import { applyRefund, quickPay } from '@/services/oms/paymentRecordService';
import { handleSubmit } from '@/services/oms/dealRecordService';

import styles from './modal.less';
import { payModalDs, refundModalDs } from '../initDs';
import DetailModal from '../../DealRecord/DetailModal';

function StatusModal(props) {
  const { recordData, handleOperationModal } = props;
  const [type, setType] = useState('zhifu');
  const ds = useMemo(() => {
    return new DataSet(type === 'zhifu' ? payModalDs(recordData) : refundModalDs(recordData));
  }, [type, recordData]);

  const attDs = useMemo(
    () =>
      new DataSet({
        fields: [
          {
            name: 'attachmentUuid',
            type: 'attachment',
            label: <span>{intl.get('smodr.deal.view.detail.payDoc').d('汇款凭证')}</span>,
            max: 10,
          },
        ],
      }),
    []
  );
  const navList = [
    {
      title: intl.get('smodr.orderLine.model.paymentInfo').d('支付信息'),
      value: 'zhifu',
    },
    {
      title: intl.get('smodr.orderLine.model.refundInfo').d('退款信息'),
      value: 'tuikuan',
    },
  ];

  async function quickpay(record) {
    if (record.get('paymentTypeCode') === 'REMITTANCE_PAYMENT') {
      props.handleOpen(record);
    } else {
      const windowHref = window.location.href;
      // const { history } = props;
      const res = getResponse(
        await quickPay({ returnUrl: windowHref, paymentOrderDTOList: [record.toData()] })
      );
      if (res && res.cashierHtml) {
        if (res?.cashierHtml?.startsWith('http')) {
          window.open(res?.cashierHtml);
        } else {
          document.open('text/html', 'replace');
          document.write(res?.cashierHtml);
          document.close();
        }
        // history.push(`/pub/spct/payment-cashier?paymentOrderNum=${res.paymentOrderNum}`);
        // window.open(`/app/pub/spct/payment-cashier?paymentOrderNum=${res.paymentOrderNum}`);
      } else if (res?.cashierUri) {
        window.open(`/app${res?.cashierUri}&cashierConfigSource=SMALL_BACK`);
      }
    }
    // const res = getResponse(
    //   await quickPay({ returnUrl: windowHref, paymentOrderDTOList: [record.toData()] })
    // );
    // if (res && res.paymentOrderNum) {
    //   window.open(`/app/pub/spct/payment-cashier?paymentOrderNum=${res.paymentOrderNum}`);
    //   // history.push(`/pub/spct/payment-cashier?paymentOrderNum=${res.paymentOrderNum}`);
    // }
  }

  async function quickRefund(record) {
    const res = getResponse(await applyRefund([record.toData()]));
    if (res && !res.failed) {
      notification.success({ message: intl.get('smodr.deal.model.refundSuccess').d('退款成功') });
      ds.query();
    }
  }

  async function handleSubmitt(record, modal = {}) {
    const attachmentUuid = attDs?.current?.get('attachmentUuid');
    const param = { paymentId: record?.get('paymentId'), attachmentUuid };
    const res = getResponse(await handleSubmit(param));
    if (res && !res.failed) {
      modal.close();
    }
  }

  function handleOpenModal(record, operationType) {
    const modal = c7nModal({
      title: intl.get('smodr.deal.view.payDealDetail').d('交易记录详情'),
      // mask: false,
      key: '1',
      style: { width: '1090px' },
      children: (
        <DetailModal
          record={record}
          attDs={attDs}
          operationType={operationType}
          customizeForm={props.customizeForm}
        />
      ),
      footer: (
        <>
          <Button color="primary" onClick={() => handleSubmitt(record, modal)}>
            {intl.get('smodr.deal.view.save').d('保存')}
          </Button>
          <Button onClick={() => modal?.close()}>
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
        </>
      ),
    });
  }

  const zhifu = [
    {
      width: 100,
      name: 'paymentStatusMeaning',
      renderer: props.getPayTag,
    },
    {
      width: 200,
      name: 'action',
      renderer: ({ record }) => (
        <span className="action-link">
          {
            record.get('paymentStatus') !== 'NON_PAYMENT' && (
              <Button
                color="primary"
                funcType="link"
                onClick={() => handleOperationModal('zhifu', record)}
              >
                {intl.get('smodr.orderLine.model.history').d('操作记录')}
              </Button>
            )
          }
          {/* 支付中、已支付 */}
          {['PAYMENT_PROCESSING', 'ALL_PAYMENT'].includes(record?.get('paymentStatus')) &&
            (
              <Button
                color="primary"
                funcType="link"
                onClick={() => handleOpenModal(record, 'PAYMENT')}
              >
                {intl.get('smodr.orderLine.model.dealRecord').d('交易记录')}
              </Button>
            )}
          {
            !!record?.get('paymentFlag') && (
              <Button
                color="primary"
                funcType="link"
                onClick={() => quickpay(record)}
              >
                {intl.get('smodr.orderLine.model.quickPay').d('立即支付')}
              </Button>
            )
          }
        </span>
      ),
    },
    {
      width: 180,
      name: 'orderCode',
    },
    {
      width: 170,
      name: 'orderAmountMeaning',
      align: 'right',
    },
    {
      width: 170,
      name: 'paymentAmountMeaning',
      align: 'right',
    },
  ];

  const tuikuan =
    recordData?.get('refundTypeCode') === 'CANCEL'
      ? [
        {
          width: 120,
          name: 'refundStatusMeaning',
          renderer: props.getRefundTag,
        },
        {
          width: 200,
          name: 'action',
          renderer: ({ record }) => (
            <span className="action-link">
              {
                record.get('refundStatus') !== 'NON_REFUND' && (
                  <Button
                    color="primary"
                    funcType="link"
                    onClick={() => handleOperationModal('tuikuan', record)}
                  >
                    {intl.get('smodr.orderLine.model.history').d('操作记录')}
                  </Button>
                )
              }
              {
                ['NON_REFUND', 'REFUND_FAILED'].includes(record?.get('refundStatus')) && (
                  <Button
                    color="primary"
                    funcType="link"
                    onClick={() => quickRefund(record)}
                  >
                    {intl.get('smodr.orderLine.model.quickRefund').d('申请退款')}
                  </Button>
                )
              }
              {
                ['REFUNDED', 'REFUNDING'].includes(record?.get('refundStatus')) && (
                  <Button
                    color="primary"
                    funcType="link"
                    onClick={() => handleOpenModal(record, 'REFUNDED')}
                  >
                    {intl.get('smodr.orderLine.model.dealRecord').d('交易记录')}
                  </Button>
                )
              }
            </span>
          ),
        },
        {
          width: 200,
          name: 'orderCode',
        },
        {
          width: 100,
          name: 'refundAmountMeaning',
          align: 'right',
        },
        {
          width: 150,
          name: 'refundTypeMeaning',
        },
      ]
      : [
        {
          width: 120,
          name: 'refundStatusMeaning',
          renderer: props.getRefundTag,
        },
        {
          width: 200,
          name: 'action',
          renderer: ({ record }) => (
            <span className="action-link">
              {
                record.get('refundStatus') !== 'NON_REFUND' && (
                  <Button
                    color="primary"
                    funcType="link"
                    onClick={() => handleOperationModal('tuikuan', record)}
                  >
                    {intl.get('smodr.orderLine.model.history').d('操作记录')}
                  </Button>
                )
              }
              {
                ['NON_REFUND', 'REFUND_FAILED'].includes(record?.get('refundStatus')) && (
                  <Button
                    color="primary"
                    funcType="link"
                    onClick={() => quickRefund(record)}
                  >
                    {intl.get('smodr.orderLine.model.quickRefund').d('申请退款')}
                  </Button>
                )
              }
              {
                ['REFUNDED', 'REFUNDING'].includes(record?.get('refundStatus')) && (
                  <Button
                    color="primary"
                    funcType="link"
                    onClick={() => handleOpenModal(record, 'REFUNDED')}
                  >
                    {intl.get('smodr.orderLine.model.dealRecord').d('交易记录')}
                  </Button>
                )
              }
            </span>
          ),
        },
        {
          width: 150,
          name: 'afterSaleCode',
        },
        {
          name: 'skuName',
        },
        {
          width: 100,
          name: 'refundAmountMeaning',
          align: 'right',
        },
        {
          width: 100,
          name: 'refundTypeMeaning',
        },
      ];
  const allColumns = {
    zhifu,
    tuikuan,
  };
  function handleChange(i) {
    setType(i.value);
  }
  return (
    <div className={styles['execute-modal-content']}>
      {/* <div className='execute-modal-container'> */}
      <div className="execute-modal-left">
        {navList.map((i) => (
          <div
            className={classNames({ 'execute-btn': true, active: i.value === type })}
            onClick={() => handleChange(i)}
          >
            {i.title}
          </div>
        ))}
      </div>
      <div className="execute-modal-right">
        <div className="execute-right-content">
          <Table
            style={{ width: 800 }}
            dataSet={ds}
            columns={allColumns[type]}
            customizedCode="SMODR.PAYMENT.STATUS.MODAL"
          />
        </div>
      </div>
    </div>
  );
}

export default withRouter(StatusModal);
