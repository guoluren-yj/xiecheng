import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { Form, Table, DataSet } from 'choerodon-ui/pro';
import { Tabs, Radio } from 'choerodon-ui';
import { stringify } from 'querystring';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/interface';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import classNames from 'classnames';

import intl from 'utils/intl';

import ImplementForm from '../../Components/ImplementForm';
import { getResponse } from '../../../utils/utils';
import Styles from '../../common.less';
import style from './index.less';
import { statusTagRender } from '../../../utils/renderer';
import { searchHeaderInfo } from '../../../services/settlePoolServices';
// import { statusTagRender } from '@/utils/renderer';
import { invoiceRecordDS } from './indexDS';
// import { searchHeaderInfo } from '../../../services/settlePoolServices';
// import Record from './PayInfoRecord';

const { TabPane } = Tabs;

const tagColor = {
  OCCUPIED: 'error',
  COMPLETED: 'success',
  LOCK: 'warn',
  REMOVE: 'warn',
};

export interface ValueType {
  billHeaderId: string,
  customizeTable: Function,
  history: any,
};

export default observer((props: ValueType) => {
  const { billHeaderId, customizeTable, history } = props;


  const [invoiceInvoice, setInvoiceTabs] = useState('invoiceFinal');
  const [invoiceIsTable, setInvoiceTable] = useState(1);

  const invoiceRecordDs = useMemo<DataSet>(() => new DataSet(invoiceRecordDS()), []);

  const { current } = invoiceRecordDs || {};

  useEffect(() => {
    invoiceRecordDs.setQueryParameter('finalFlag', invoiceIsTable);
    invoiceRecordDs.setQueryParameter('billHeaderId', billHeaderId);
    invoiceRecordDs.setQueryParameter('documentType', 'INVOICE');
    invoiceRecordDs.query();
  }, []);

  const handleChangeModeInv = useCallback((e: any) => {
    invoiceRecordDs.setQueryParameter('finalFlag', e.target.value);
    invoiceRecordDs.query();
    setInvoiceTabs(e.target.value === 1 ? 'invoiceFinal' : 'invoiceRecord');
    setInvoiceTable(e.target.value);
  }, [invoiceRecordDs, setInvoiceTabs, setInvoiceTable]);


  const handleStatementDetail = useCallback(async (currentRecord) => {
    const settleHeaderId = currentRecord.get('documentId');
    const settleHeaderNum = currentRecord.get('documentNum');
    const res = getResponse(await searchHeaderInfo({ settleHeaderNum }));
    const { documentType } = res || {};
    if (!res || !documentType) return;
    history.push({
      pathname: `/ssta/new-supply-settle/${documentType.toLowerCase()}/${settleHeaderId}`,
      search: stringify({
        source: 'pool',
        type: 'view',
      }),
    });
  }, [history]);

  /**
   * 收款记录表格列
   */
  const invoiceColumns: ColumnProps[] = useMemo(() => {
    return [
      {
        width: 160,
        name: 'settleNum',
      },
      {
        name: 'recordStatusMeaning',
        width: 100,
        renderer: ({ value, record }) =>
          statusTagRender(value, tagColor[record?.get('recordStatus')]),
      },
      {
        width: 180,
        name: 'documentNumAndLine',
      },

      {
        width: 80,
        name: 'quantity',
      },
      {
        width: 160,
        name: 'companyName',
      },
      {
        name: 'netPrice',
        width: 120,
      },
      {
        width: 120,
        name: 'taxIncludedPrice',
      },
      {
        width: 80,
        name: 'taxRate',
      },
      {
        width: 100,
        name: 'taxAmount',
      },
      {
        width: 100,
        name: 'recordDate',
      },
      {
        width: 80,
        name: 'recordSource',
      },
      {
        width: 80,
        name: 'campMeaning',
      },
      {
        width: 100,
        name: 'createdUserName',
      },
      {
        width: 100,
        name: 'creationDate',
      },
      {
        name: 'operation',
        width: 80,
        renderer: ({ record }) => {
          if (!['LOCK', 'REMOVE'].includes(record?.get('recordStatus'))) {
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
  }, [invoiceIsTable, handleStatementDetail]);

  // settleBasePriceFlag 0基准价即有含税又有不含税 1只有不含税 2只有含税
  // settleMatchFlag 0维度即有数量又有金额 1只有数量 2只有金额
  const { amountPrecision, currencyCode = '', uom, settleBasePriceFlag = 0, settleMatchFlag = 0 } = useMemo(() => {
    return current?.get(['currencyCode', 'amountPrecision', 'settleMatchDimension', 'uom', 'settleBasePriceFlag', 'settleMatchFlag']) || {};
  }, [current]);
  const detailData = useMemo(() => {
    return current?.toData() || {};
  }, [current]);

  return (
    <div style={{ marginTop: '10px' }}>
      <Form columns={2} labelLayout={LabelLayout.vertical} className={classNames(Styles['card-implementForm'], style[`card-implementForm-Implement`])}>
        {[0, 1].includes(Number(settleMatchFlag)) && (
          <ImplementForm
            detailData={detailData}
            data={[
              {
                position: 'top',
                icon: 'lock_clock',
                name: ['totalOccupiedQuantity'],
                label: `${intl.get('ssta.common.model.common.occupiedQuantity').d('占用数量')}${uom ? `(${uom})` : ''}`,
                amountPrecision,
              },
            ]}
          />
        )}
        {[0, 1].includes(Number(settleMatchFlag)) && (
          <ImplementForm
            detailData={detailData}
            data={[
              {
                position: 'top',
                icon: 'done',
                name: ['totalCompletedQuantity'],
                label: `${intl.get('ssta.common.model.common.completedQuantity').d('完成数量')}${uom ? `(${uom})` : ''}`,
                amountPrecision,
              },
            ]}
          />
        )}
        {[0, 2].includes(Number(settleMatchFlag)) && [0, 2].includes(Number(settleBasePriceFlag)) && (
          <ImplementForm
            detailData={detailData}
            data={[
              {
                position: 'top',
                icon: 'lock_clock',
                name: ['totalTaxIncludedOccupiedAmount'],
                label: `${intl.get('ssta.common.model.common.occupiedAmountWithTax').d('占用金额(含税)')}(${currencyCode})`,
                amountPrecision,
              },
            ]}
          />
        )}
        {[0, 2].includes(Number(settleMatchFlag)) && [0, 2].includes(Number(settleBasePriceFlag)) && (
          <ImplementForm
            detailData={detailData}
            data={[
              {
                position: 'top',
                icon: 'done',
                name: ['totalTaxIncludedCompletedAmount'],
                label: `${intl.get('ssta.common.model.common.completedAmountWithTax').d('完成金额(含税)')}(${currencyCode})`,
                amountPrecision,
              },
            ]}
          />
        )}
        {[0, 2].includes(Number(settleMatchFlag)) && [0, 1].includes(Number(settleBasePriceFlag)) && (
          <ImplementForm
            detailData={detailData}
            data={[
              {
                position: 'top',
                icon: 'lock_clock',
                name: ['totalNetOccupiedAmount'],
                label: `${intl.get('ssta.common.model.common.occupiedAmountNet').d('占用金额(不含税)')}(${currencyCode})`,
                amountPrecision,
              },
            ]}
          />
        )}
        {[0, 2].includes(Number(settleMatchFlag)) && [0, 1].includes(Number(settleBasePriceFlag)) && (
          <ImplementForm
            detailData={detailData}
            data={[
              {
                position: 'top',
                icon: 'done',
                name: ['totalNetCompletedAmount'],
                label: `${intl.get('ssta.common.model.common.completedAmountNet').d('完成金额(不含税)')}(${currencyCode})`,
                amountPrecision,
              },
            ]}
          />
        )}
      </Form>
      <div className={Styles['ssta-detailDrawer-content']} style={{marginTop: '-16px'}}>
        <Tabs
          activeKey={invoiceInvoice}
          animated
          tabBarExtraContent={
            <div className="ssta-reconciliation-mode">
              <Radio.Group value={Number(invoiceIsTable)} onChange={handleChangeModeInv}>
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
          <TabPane key={Number(invoiceIsTable) === 1 ? 'invoiceFinal' : 'invoiceRecord'}>
            {
              customizeTable({
                code: 'SSTA.SUPPLIER_BILL_LIST.INVOICE_RECORD',
              }, <Table columns={invoiceColumns} dataSet={invoiceRecordDs} />)
            }
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
});
