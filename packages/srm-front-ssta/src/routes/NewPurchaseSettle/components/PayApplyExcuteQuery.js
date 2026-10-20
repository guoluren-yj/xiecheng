import React, { useState, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Form, Table, DataSet, Modal } from 'choerodon-ui/pro';
import { Tabs, Radio } from 'choerodon-ui';
import { stringify } from 'querystring';

import intl from 'utils/intl';

import ImplementForm from '@/routes/Components/ImplementForm';
import { getResponse } from '@/utils/utils';
import Styles from '@/routes/common.less';
import { statusTagRender } from '@/utils/renderer';
import { payDS } from '../../../stores/NewPurchaseSettleDS';
import { searchHeaderInfo } from '../../../services/settlePoolServices';
import Record from './PayInfoRecord';

const { TabPane } = Tabs;

export default observer((props) => {
  const { record, history, customizeTable } = props;

  const { settleHeaderId } = record?.get(['settleHeaderId']) || {};

  const [paymentTabs, setPaymentTabs] = useState('paymentFinal');
  const [paymentIsTable, setPaymentTable] = useState(1);

  const payDs = useMemo(() => new DataSet(payDS()), []);

  useEffect(() => {
    payDs.setQueryParameter('settleHeaderId', settleHeaderId);
    payDs.setQueryParameter('documentType', 'PAYMENT');
    payDs.setQueryParameter('finalFlag', paymentIsTable);
    payDs.query();
  }, []);

  const handleChangeModePayment = (e) => {
    payDs.setQueryParameter('finalFlag', e.target.value);
    payDs.query();
    setPaymentTabs(e.target.value === 1 ? 'paymentFinal' : 'paymentRecord');
    setPaymentTable(e.target.value);
  };

  const handleRecord = (records) => {
    Modal.open({
      // mask: false,
      drawer: true,
      title: intl.get(`ssta.purchaseSettlePool.view.title.payinfo`).d('付款明细信息'),
      closable: true,
      footer: null,
      className: Styles['ssta-large-modal'],
      children: <Record settleRecordId={records.get('settleRecordId')} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  /**
   * 发票匹配,付款审批详情 - 跳转
   * @param {*} record
   */
  const handleStatementDetail = async (currentRecord) => {
    const settleHeaderId = currentRecord.get('documentId');
    const settleHeaderNum = currentRecord.get('documentNum');
    const res = getResponse(await searchHeaderInfo({ settleHeaderNum }));
    if (!res || !res?.documentType) return;
    const { documentType } = res;

    history.push({
      pathname: `/ssta/new-purchase-settle/${documentType.toLowerCase()}/${settleHeaderId}`,
      search: stringify({
        source: 'pool',
        type: 'view',
      }),
    });
  };

  /**
   * 收款记录表格列
   */
  const payColumns = React.useMemo(() => {
    return [
      {
        width: 120,
        name: 'recordStatusMeaning',
        renderer: (records) => {
          let color = '';
          switch (records.record.get('recordStatus')) {
            case 'OCCUPIED':
              color = 'error';
              break;

            case 'CANCELED':
              color = 'info';
              break;

            case 'COMPLETED':
              color = 'success';
              break;

            default:
              color = 'warn';
              break;
          }
          return statusTagRender(records.value, color);
        },
      },
      {
        name: 'settleNum',
        width: 250,
      },
      {
        width: 200,
        name: 'documentNum',
        renderer: (records) => {
          return <a onClick={() => handleRecord(records.record)}>{records.value}</a>;
        },
      },

      {
        width: 200,
        name: 'paymentTypeMeaning',
      },
      {
        width: 200,
        name: 'paymentAmount',
      },
      {
        name: 'recordDate',
        width: 150,
      },
      {
        width: 120,
        name: 'recordSource',
      },
      {
        width: 120,
        name: 'companyName',
      },
      {
        width: 120,
        name: 'supplierCompanyName',
      },
      {
        width: 120,
        name: 'campMeaning',
      },
      {
        width: 120,
        name: 'createdUserName',
      },
      {
        width: 120,
        name: 'creationDate',
      },
      {
        width: 120,
        name: 'remark',
      },
      {
        name: 'operation',
        width: 80,
        renderer: ({ record }) => {
          if (!['LOCK', 'REMOVE'].includes(record.get('recordStatus'))) {
            return (
              <a
                onClick={() => {
                  handleStatementDetail(record);
                }}
              >
                {intl.get('hzero.common.button.seeHandleDetail').d('查看执行情况')}
              </a>
            );
          }
        },
      },
    ];
  }, [paymentIsTable]);

  const { amountPrecision, currencyCode = '' } =
    payDs.records?.[0]?.get(['currencyCode', 'amountPrecision']) || {};
  const DetailData = payDs.records?.[0]?.toData() || {};

  return (
    <div style={{ marginTop: '10px' }}>
      <Form columns={2} labelLayout="vertical" className={Styles['card-implementForm']}>
        <ImplementForm
          detailData={DetailData || {}}
          data={[
            {
              position: 'top',
              icon: 'lock_clock',
              name: ['totalPaymentOccupiedAmount'],
              label: `${intl.get('ssta.common.model.common.occupiedAmount').d('占用金额')}${
                currencyCode ? `(${currencyCode})` : ''
              }`,
              amountPrecision,
            },
          ]}
        />
        <ImplementForm
          detailData={DetailData || {}}
          data={[
            {
              position: 'top',
              icon: 'done',
              name: ['totalPaymentCompletedAmount'],
              label: `${intl.get('ssta.common.model.common.completedAmount').d('完成金额')}${
                currencyCode ? `(${currencyCode})` : ''
              }`,
              amountPrecision,
            },
          ]}
        />
      </Form>
      <div className={Styles['ssta-detailDrawer-content']}>
        <Tabs
          activeKey={paymentTabs}
          animated
          tabBarExtraContent={
            <div className="ssta-reconciliation-mode">
              <Radio.Group value={Number(paymentIsTable)} onChange={handleChangeModePayment}>
                <Radio.Button value={1}>
                  {intl.get(`ssta.purchaseSettlePool.button.inalDisplay`).d('最终展示')}
                </Radio.Button>
                <Radio.Button value={0}>
                  {intl.get(`ssta.purchaseSettlePool.button.displayRecord`).d('展示记录')}
                </Radio.Button>
              </Radio.Group>
            </div>
          }
        >
          <TabPane key={Number(paymentIsTable) === 1 ? 'paymentFinal' : 'paymentRecord'}>
            {customizeTable(
              { code: 'SSTA.PURCHASE_SETTLE_LIST.PAY_APPLY_EXCUTE_LINE' },
              <Table columns={payColumns} dataSet={payDs} queryBar="none" />
            )}
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
});
