import React, { useState, useMemo } from 'react';
import { DataSet, Table, Button, Tabs } from 'choerodon-ui/pro';
import { Tag, Tooltip, Icon } from 'choerodon-ui';

import c7nModal from '@/utils/c7nModal';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import Image from '@/components/Image';
import { handleToCheck, handleToAgainCheck, handleToReceiveCheck, fetchSaleRetry, initiatePay } from '@/services/oms/orderLineManageService';
import { compose } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import styles from './index.less';
import { ds } from '../ExtensionTable/ds';
import {
  color,
  preemColor,
  approveColor,
  shipmentColor,
  receiveColor,
  afterColor,
  stateColor,
  invoiceColor,
} from '../ExtensionTable/colorRender';
import DeliveryOrder from '../../DeliveryOrder';
import AcceptOrder from '../../AcceptOrder';
import ReconciliationOrder from '../../ReconciliationOrder';
import AfterSaleOrder from '../../AfterSaleOrder';
import InvoiceDetail from '../InvoiceDetail';

const { TabPane } = Tabs;

function ExecuteStatusModal(props) {
  const { recordData, handleOpenModal, customizeTable } = props;
  const [type, setType] = useState('quxiao'); // 当前激活tab
  const initDs = useMemo(() => {
    return new DataSet(ds(type, recordData?.get('orderEntryId')));
  }, [type, recordData]);

  const navList = [
    {
      title: intl.get('smodr.orderLine.model.quxiaoInfo').d('取消信息'),
      value: 'quxiao',
    },
    {
      title: intl.get('smodr.orderLine.model.yuzhanInfo').d('预占信息'),
      value: 'yuzhan',
    },
    {
      title: intl.get('smodr.orderLine.model.shenpiInfo').d('审批信息'),
      value: 'shenpi',
    },
    {
      title: intl.get('smodr.orderLine.model.peisongInfo').d('配送信息'),
      value: 'peisong',
    },
    {
      title: intl.get('smodr.orderLine.model.jieshouInfo').d('接收信息'),
      value: 'jieshou',
      customizedCode: "SMODR.ORDER.ENTRY.RECEIVE_INFO.LIST",
    },
    {
      title: intl.get('smodr.orderLine.model.shouhuoInfo').d('售后信息'),
      value: 'shouhou',
    },
    {
      title: intl.get('smodr.orderLine.model.duizhangInfo').d('对账信息'),
      value: 'duizhang',
    },
    {
      title: intl.get('smodr.orderLine.model.invoiceInfo').d('开票信息'),
      value: 'invoice',
    },
  ];

  const handleToDelivery = (value) => {
    const exeModal = c7nModal({
      title: intl.get('smodr.orderLine.model.consInfo').d('配送单详情'),
      children: <DeliveryOrder consignmentCode={value} />,
      style: { width: 1090 },
      footer: (
        <Button onClick={() => exeModal?.close()} color="primary">
          {intl.get('smodr.orderLine.model.close').d('关闭')}
        </Button>
      ),
    });
  };

  const handleToAccept = (value, { readOnly = true } = {}) => {
    const exeModal = c7nModal({
      title: intl.get('smodr.orderLine.model.acceptInfo').d('接收单详情'),
      children: <AcceptOrder receiptCode={value} readOnly={readOnly} />,
      style: { width: 1090 },
      footer: (
        <Button onClick={() => exeModal?.close()} color="primary">
          {intl.get('smodr.orderLine.model.close').d('关闭')}
        </Button>
      ),
    });
  };

  const handleToStatement = (value) => {
    const exeModal = c7nModal({
      title: intl.get('smodr.orderLine.model.statementInfo').d('对账单详情'),
      children: <ReconciliationOrder statementsCode={value} />,
      style: { width: 1090 },
      footer: (
        <Button onClick={() => exeModal?.close()} color="primary">
          {intl.get('smodr.orderLine.model.close').d('关闭')}
        </Button>
      ),
    });
  };

  const handleToAfterSale = (value) => {
    const exeModal = c7nModal({
      title: intl.get('smodr.orderLine.model.afterInfo').d('售后单详情'),
      children: <AfterSaleOrder afterSaleCode={value} />,
      style: { width: 1090 },
      footer: (
        <Button onClick={() => exeModal?.close()} color="primary">
          {intl.get('smodr.orderLine.model.close').d('关闭')}
        </Button>
      ),
    });
  };

  async function handleCheck(record) {
    const res = getResponse(await handleToCheck(record.toData()));
    if (res && res.success) {
      initDs.query();
      notification.success();
    } else {
      notification.error({ message: res?.message });
    }
  }

  async function handleAgainCheck(record, paramType) {
    const res = getResponse(await handleToAgainCheck(record.toData(), paramType));
    if (res && res.success) {
      initDs.query();
      notification.success();
    } else {
      notification.error({ message: res?.message });
    }
  }

  async function handleSaleRetry(record) {
    const res = getResponse(await fetchSaleRetry([record.get('afterSaleCode')]));
    if (res && res.success) {
      initDs.query();
      notification.success();
    } else {
      notification.error({ message: res?.resultMsg });
    }
  }

  async function handleAgainReceiveCheck(record) {
    const res = getResponse(await handleToReceiveCheck(record.toData()));
    if (res && res.success) {
      initDs.query();
      notification.success();
    } else {
      notification.error({ message: res?.message });
    }
  }

  const handlePayCheck = async (record) => {
    const res = getResponse(await initiatePay({ orderId: record?.get('orderId') }));
    if (res && res.success) {
      initDs.query();
      notification.success();
    }
    else if (res && res.success === false) {
      notification.error({ message: res?.resultMsg });
    }
  };

  const yuzhan = [
    {
      width: 140,
      name: 'preemptionStatusMeaning',
      renderer: ({ value, record }) => <Tag color={preemColor(record)} style={{ border: 'none' }}>{value || '-'}</Tag>,
    },
    {
      width: 120,
      name: 'operation',
      renderer: ({ record }) => (
        <span className={styles['action-link-btns']}>
          {/* <span>{intl.get('smodr.orderLine.model.newExamine').d('关联单据')}</span> */}
          {record.get('preemptionStatus') === 'NOT_PREEMPT' ? '-' : (
            <Button
              color="primary"
              funcType="link"
              onClick={() => handleOpenModal('yuzhan', record)}
            >
              {intl.get('smodr.orderLine.model.history').d('操作记录')}
            </Button>
          )}
          {recordData.get('orderTypeCode') === 'EC' &&
            record.get('preemptionStatus') === 'CONFIRMED_FAILED' && (
              <Button color="primary" funcType="link" onClick={() => handleCheck(record)}>
                {intl.get('smodr.orderLine.model.sponsorCheck').d('发起确认')}
              </Button>
            )}
          {/* ecPaymentFlag 为0 显示发起扣款 */}
          {!record.get('ecPaymentFlag') && (
            <Button color="primary" funcType="link" onClick={() => handlePayCheck(record)}>
              {intl.get('smodr.orderLine.model.payCheck').d('发起扣款')}
            </Button>
          )}
        </span>
      ),

    },
    {
      name: 'description',
    },
    {
      width: 150,
      name: 'viewQuantityMeaning',
      align: 'right',
    },
    {
      width: 140,
      name: 'preemptDateTime',
    },
  ];
  const shenpi = [
    {
      width: 140,
      name: 'approveStatusMeaning',
      renderer: ({ value, record }) => <Tag color={approveColor(record)} style={{ border: 'none' }}>{value || '-'}</Tag>,
    },
    {
      width: 100,
      name: 'operation',
      renderer: ({ record }) => (
        <span className={styles['action-link-btns']}>
          {/* <span>{intl.get('smodr.orderLine.model.newExamine').d('关联单据')}</span> */}
          {record.get('approveStatus') === 'NOT_APPROVE' ? '-' : (
            <Button
              color="primary"
              funcType="link"
              onClick={() => handleOpenModal('shenpi', record, recordData)}
            >
              {intl.get('smodr.orderLine.model.history').d('操作记录')}
            </Button>
          )}
        </span>
      ),
    },
    {
      width: 100,
      name: 'viewQuantityMeaning',
      align: 'right',
    },
    {
      name: 'rejectedReason',
    },
    {
      width: 140,
      name: 'approveDateTime',
    },
  ];
  const peisong = [
    {
      width: 140,
      name: 'consignmentStatusMeaning',
      renderer: ({ value, record }) => <Tag color={shipmentColor(record)} style={{ border: 'none' }}>{value || '-'}</Tag>,
    },
    {
      width: 150,
      name: 'operation',
      renderer: ({ record }) => (
        <span className={styles['action-link-btns']}>
          {/* <span>{intl.get('smodr.orderLine.model.newExamine').d('关联单据')}</span> */}
          {record.get('consignmentStatus') === 'NOT_DISTRIBUTE' ? '-' : (
            <Button
              color="primary"
              funcType="link"
              onClick={() => handleOpenModal('peisong', record)}
            >
              {intl.get('smodr.orderLine.model.history').d('操作记录')}
            </Button>
          )}
          {record.get('resendFlag') === 1 && (
            <Button color="primary" funcType="link" onClick={() => handleAgainCheck(record, 'consignment')}>
              {intl.get('smodr.orderLine.model.consignmentAgain').d('配送重推')}
            </Button>
          )}
          {['DELIVERY_SUCCESS', 'DELIVERY_FAILED'].includes(record.get('consignmentStatus')) && (
            <Button color="primary" funcType="link" onClick={() => handleAgainCheck(record, 'delievered')}>
              {intl.get('smodr.orderLine.model.delieveredAgain').d('妥投重推')}
            </Button>
          )}
        </span>
      ),
    },
    {
      width: 170,
      name: 'consignmentCode',
      renderer: ({ value }) => value ? (
        <Button color="primary" funcType="link" onClick={() => handleToDelivery(value)}>
          {value}
        </Button>
      ) : '-',
    },
    {
      width: 80,
      name: 'viewQuantityMeaning',
      align: 'right',
    },
    {
      width: 80,
      name: 'consignmentCancelQuantityMeaning',
      align: 'right',
    },
    {
      width: 140,
      name: 'shippedTime',
    },
    {
      width: 140,
      name: 'completedTime',
    },
  ];
  const jieshou = [
    {
      width: 140,
      name: 'receiptStatusMeaning',
      renderer: ({ value, record }) => (
        <Tag
          color={receiveColor(record)}
          style={{ border: 'none', display: 'inline-flex', alignItems: 'center' }}
        >
          <span>{value || '-'}</span>
          {record.get('approveRemark') && record.get('receiptStatus') === 'REJECTED' && (
            <Tooltip title={record.get('approveRemark')}>
              <Icon
                type="error"
                style={{ fontSize: '14px', marginLeft: '4px', fontWeight: 400 }}
              />
            </Tooltip>
          )}
        </Tag>
),
    },
    {
      width: 150,
      name: 'operation',
      renderer: ({ record }) => (
        <span className={styles['action-link-btns']}>
          {/* <span>{intl.get('smodr.orderLine.model.newExamine').d('关联单据')}</span> */}
          {record.get('receiptStatus') === 'NOT_RECEIVE' ? '-' : (
            <Button
              color="primary"
              funcType="link"
              onClick={() => handleOpenModal('jieshou', record, recordData)}
            >
              {intl.get('smodr.orderLine.model.history').d('操作记录')}
            </Button>
          )}
          {record.get('resendFlag') === 1 && (
            <Button color="primary" funcType="link" onClick={() => handleAgainReceiveCheck(record, 'delievered')}>
              {intl.get('smodr.orderLine.model.receiptAgain').d('接收重推')}
            </Button>
          )}
        </span>
      ),
    },
    {
      width: 160,
      name: 'receiptCode',
      renderer: ({ value, record }) => value ? (
        <Button color="primary" funcType="link" onClick={() => handleToAccept(value)}>
          {value}{record.get('receiptLineNum') ? `-${record.get('receiptLineNum')}` : ''}
        </Button>
      ) : '-',
    },
    {
      width: 120,
      name: 'viewQuantityMeaning',
      align: 'right',
    },
    {
      width: 120,
      name: 'invalidQuantity',
      align: 'right',
    },
    {
      width: 140,
      name: 'receiptedTime',
    },
  ];
  const duizhang = [
    {
      width: 140,
      name: 'statementsStatusMeaning',
      renderer: ({ value, record }) => <Tag color={stateColor(record)} style={{ border: 'none' }}>{value || '-'}</Tag>,
    },
    {
      width: 100,
      name: 'operation',
      renderer: ({ record }) => (
        <span className={styles['action-link-btns']}>
          {/* <span>{intl.get('smodr.orderLine.model.newExamine').d('关联单据')}</span> */}
          {record.get('statementsStatus') === 'NOT_STATEMENTS' ? '-' : (
            <Button
              color="primary"
              funcType="link"
              onClick={() => handleOpenModal('duizhang', record)}
            >
              {intl.get('smodr.orderLine.model.history').d('操作记录')}
            </Button>
          )}
        </span>
      ),
    },
    {
      width: 200,
      name: 'statementsCode',
      renderer: ({ value }) => value ? (
        <Button color="primary" funcType="link" onClick={() => handleToStatement(value)}>
          {value}
        </Button>
      ) : '-',
    },
    {
      width: 100,
      name: 'viewQuantityMeaning',
      align: 'right',
    },
    {
      width: 140,
      name: 'statementsTime',
    },
  ];
  // 开票信息
  const invoice = [
    {
      width: 140,
      name: 'requestStatus',
      renderer: ({ record }) => <Tag color={invoiceColor(record)} style={{ border: 'none' }}>{record.get('requestStatusMeaning') || '-'}</Tag>,
    },
    {
      width: 100,
      name: 'operation',
      renderer: ({ record }) => record.get('requestStatus') === 'NON_INVOICE' ? '-' : (
        (
          <span className={styles['action-link-btns']}>
            <Button
              color="primary"
              funcType="link"
              onClick={() => handleOpenModal('invoice', record)}
            >
              {intl.get('smodr.orderLine.model.history').d('操作记录')}
            </Button>
          </span>
        )
      ),
    },
    {
      width: 200,
      name: 'requestNum',
      renderer: ({ value, record }) => value ? (
        <a onClick={() => {
          const exeModal = c7nModal({
            title: intl.get('smodr.orderLine.model.invoiceDetailInfo').d('开票单详情'),
            children: <InvoiceDetail requestId={record.get('invoiceReqId')} />,
            style: { width: 1090 },
            footer: (
              <Button onClick={() => exeModal?.close()} color="primary">
                {intl.get('smodr.orderLine.model.close').d('关闭')}
              </Button>
            ),
          });
        }}
        >
          {value}
        </a>
      ) : '-',
    },
    {
      width: 100,
      name: 'quantityMeaning',
      title: intl.get('smodr.orderLine.model.quantity').d('数量'),
      align: 'right',
    },
    {
      width: 140,
      name: 'invoiceUpdateDate',
      title: intl.get('smodr.orderLine.model.approveTime').d('更新时间'),
    },
  ].filter(f => f.show !== false);

  const shouhou = [
    {
      width: 140,
      name: 'afterSaleStatusMeaning',
      renderer: ({ value, record }) => <Tag color={afterColor(record)} style={{ border: 'none' }}>{value || '-'}</Tag>,
    },
    {
      width: 100,
      name: 'operation',
      renderer: ({ record }) => (
        <span className={styles['action-link-btns']}>
          {/* <span>{intl.get('smodr.orderLine.model.newExamine').d('关联单据')}</span> */}
          {record.get('afterSaleStatus') === 'NOT_SALE_AFTER' ? '-' : (
            <>
              <Button
                color="primary"
                funcType="link"
                onClick={() => handleOpenModal('shouhou', record, recordData)}
              >
                {intl.get('smodr.orderLine.model.history').d('操作记录')}
              </Button>
              {record.get('canRetryPushMsgToSrm') && (
                <Button
                  color="primary"
                  funcType="link"
                  onClick={() => handleSaleRetry(record)}
                >
                  {intl.get('smodr.orderLine.model.saleRetry').d('售后重推 ')}
                </Button>
              )}
            </>
          )}
        </span>
      ),
    },
    {
      width: 200,
      name: 'afterSaleCode',
      renderer: ({ value }) => value ? (
        <Button color="primary" funcType="link" onClick={() => handleToAfterSale(value)}>
          {value}
        </Button>
      ) : '-',
    },
    {
      width: 80,
      name: 'viewQuantityMeaning',
      align: 'right',
    },
    {
      width: 100,
      name: 'afterSaleTypeMeaning',
    },
    {
      width: 140,
      name: 'afterSaleTime',
    },
  ];
  const quxiao = [
    {
      width: 140,
      name: 'cancelStatusMeaning',
      renderer: ({ value, record }) => <Tag color={color(record)} style={{ border: 'none' }}>{value || '-'}</Tag>,
    },
    {
      width: 100,
      name: 'operation',
      renderer: ({ record }) => (
        <span className={styles['action-link-btns']}>
          {record.get('cancelStatus') === 'NOT_CANCEL' ? '-' : (
            <Button
              color="primary"
              funcType="link"
              onClick={() => handleOpenModal('quxiao', record)}
            >
              {intl.get('smodr.orderLine.model.history').d('操作记录')}
            </Button>
          )}
        </span>
      ),
    },
    {
      width: 120,
      name: 'viewQuantityMeaning',
      align: 'right',
    },
    {
      name: 'cancelReason',
    },
    {
      width: 140,
      name: 'lastUpdateDate',
    },
  ];
  const allColumns = {
    quxiao,
    yuzhan,
    shenpi,
    peisong,
    jieshou,
    shouhou,
    duizhang,
    invoice,
  };
  function handleChange(key) {
    setType(key);
  }
  return (
    <div className={styles['execute-modal-content']}>
      <Tabs defaultActiveKey="1" tabPosition="left" onTabClick={handleChange}>
        {navList.map((tab) => (
          <TabPane tab={tab.title} key={tab.value}>
            <div className="execute-right-content">
              <div className="execute-right-top">
                <div className="execute-right-img">
                  <Image value={recordData?.get('primaryUrl')} width={80} height={80} />
                </div>
                <div className="execute-right-label">
                  <div className="execute-right-title">{recordData.get('skuName')}</div>
                  <div className="execute-right-code">
                    {intl.get('smodr.orderLine.model.orderCode').d('商城订单编码')}：
                    {recordData?.get('orderCode')}
                  </div>
                  <div className="execute-right-sku">
                    {intl.get('smodr.orderLine.model.skuCode').d('商品编码')}：
                    {recordData?.get('skuCode')}
                  </div>
                </div>
              </div>
              {tab.customizedCode ? customizeTable(
                { code: tab.customizedCode },
                <Table
                  style={{ width: 800, maxHeight: 'calc(100vh - 300px)' }}
                  dataSet={initDs}
                  columns={allColumns[type]}
                  customizedCode={tab.customizedCode}
                />
                ) : (
                  <Table
                    style={{ width: 800, maxHeight: 'calc(100vh - 300px)' }}
                    dataSet={initDs}
                    columns={allColumns[type]}
                    customizedCode="SMODR.ORDER.ENTRY.STATUS"
                  />
              )}
            </div>
          </TabPane>
        )
        )}
      </Tabs>
    </div>
  );
}

export default compose(
  withCustomize({
    unitCode: ['SMODR.ORDER.ENTRY.RECEIVE_INFO.LIST'],
  }),
)(ExecuteStatusModal);
