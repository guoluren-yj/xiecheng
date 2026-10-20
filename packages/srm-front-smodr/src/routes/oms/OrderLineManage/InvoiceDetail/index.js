import React, { useCallback, useEffect, useMemo } from 'react';
import { Tag } from 'choerodon-ui';
import { DataSet, Table, Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import FormPro from '@/routes/components/FormPro';
import SecondCard from '@/routes/components/SecondCard';
import { receiptColor } from '../ExtensionTable/colorRender';
import { baseInfoDS, invoiceSkuDS, invoiceAddFreightDS, invoiceDS } from './ds';

// import styles from './index.less';

// export const SubContent = (props) => {
//   const { id, title, showDivide, children, style } = props;
//   return (
//     <>
//       {showDivide && <div className={styles['content-divide']} />}
//       <div id={id} className={`${styles['sub-content-container']}`} style={style}>
//         <div className="sub-content-header" id={id}>
//           <span>{title}</span>
//         </div>
//         <div className="sub-content-body">{children}</div>
//       </div>
//     </>
//   );
// };

function Detail(props) {
  const { requestId } = props;
  // const { requestId } = qs.parse(search.substr(1));
  const baseInfoDs = useMemo(() => new DataSet(baseInfoDS()), []);
  const invoiceSkuDs = useMemo(() => new DataSet(invoiceSkuDS()), []);
  const invoiceAddFreightDs = useMemo(() => new DataSet(invoiceAddFreightDS()), []);
  const invoiceDs = useMemo(() => new DataSet(invoiceDS()), []);
  useEffect(() => {
    baseInfoDs.setQueryParameter('requestId', requestId);
    baseInfoDs.query();
    invoiceSkuDs.setQueryParameter('requestId', requestId);
    invoiceAddFreightDs.setQueryParameter('requestId', requestId);
    invoiceDs.setQueryParameter('requestId', requestId);
    invoiceSkuDs.query();
    invoiceAddFreightDs.query();
    invoiceDs.query();
  }, [requestId]);

  const fields = useMemo(() => {
    return [
      { name: 'requestNum' },
      { name: 'applicationNo' },
      { name: 'ecApplicationNo' },
      { name: 'sourceFromMeaning' },
      { name: 'requestStatusMeaning' },
      { name: 'currencyName' },
      { name: 'requestAmountMeaning' },
      { name: 'purchaseCompanyName' },
      { name: 'supplierCompanyName' },
      { name: 'creationByName' },
      { name: 'creationDate' },
      { name: 'lastUpdateDate' },
    ];
  }, []);

  const getColumns = useCallback((type) => {
    switch (type) {
      case 'sku':
        return [
          {
            name: 'skuCode',
            width: 120,
          },
          {
            name: 'skuName',
            width: 150,
          },
          {
            name: 'quantity',
            width: 100,
          },
          {
            name: 'uomName',
            width: 80,
          },
          {
            name: 'taxRate',
            width: 80,
          },
          {
            name: 'currencyName',
            width: 100,
          },
          {
            name: 'unitPriceMeaning',
            width: 120,
            align: 'right',
          },
          {
            name: 'unitNakedPriceMeaning',
            width: 120,
            align: 'right',
          },
          {
            name: 'per',
            width: 100,
          },
          {
            name: 'amountMeaning',
            width: 120,
            align: 'right',
          },
          {
            name: 'nakedAmountMeaning',
            width: 120,
            align: 'right',
          },
        ];
      case 'freight':
        return [
          {
            name: 'extraCostTypeMeaning',
            width: 120,
          },
          {
            name: 'skuName',
            width: 150,
          },

          {
            name: 'quantity',
            width: 100,
          },
          {
            name: 'uomName',
            width: 80,
          },
          {
            name: 'taxRate',
            width: 80,
          },
          {
            name: 'currencyName',
            width: 100,
          },
          {
            name: 'unitPriceMeaning',
            width: 120,
            align: 'right',
          },
          {
            name: 'unitNakedPriceMeaning',
            width: 120,
            align: 'right',
          },
          {
            name: 'per',
            width: 100,
          },
          {
            name: 'amountMeaning',
            width: 120,
            align: 'right',
          },
          {
            name: 'nakedAmountMeaning',
            width: 120,
            align: 'right',
          },
        ];
      case 'invoice':
        return [
          {
            name: 'validityStatusMeaning',
            width: 120,
            renderer: ({ record, text }) => text ? <Tag color={receiptColor(record)} style={{ border: 'none' }}>{text}</Tag> : '',
          },
          {
            name: 'invoiceBatch',
            width: 160,
          },
          {
            name: 'invoiceCode',
            width: 160,
          },
          {
            name: 'invoiceTime',
            width: 150,
          },
          {
            name: 'invoiceOrderNetAmount',
            width: 120,
            align: 'right',
          },
          {
            name: 'invoiceTaxAmount',
            width: 120,
            align: 'right',
          },
          {
            name: 'invoiceAmountMeaning',
            width: 120,
            align: 'right',
          },
          {
            name: 'invoiceTypeMeaning',
            width: 120,
          },
          {
            name: 'invoiceStateMeaning',
            width: 120,
          },
          {
            name: 'invoiceTitle',
            minWidth: 180,
          },
          {
            name: 'invoiceContentCode',
            width: 120,
          },
          {
            name: 'regCode',
            width: 170,
          },
          {
            name: 'depositBank',
            width: 180,
          },
          {
            name: 'bankAccountNum',
            width: 120,
          },
          {
            name: 'contactAddress',
            width: 200,
          },
          {
            name: 'contactNumber',
            width: 120,
          },
          {
            name: 'originalInvoiceId',
            width: 120,
          },
          {
            name: 'originalInvoiceCode',
            width: 120,
          },
        ];
      default: return [];
    }
  }, []);

  return (
    <>
      <SecondCard title={intl.get('smodr.invoice.view.baseInfo').d('基本信息')} offsetTop={0}>
        <Spin dataSet={baseInfoDs}>
          <FormPro
            style={{ width: '75%' }}
            dataSet={baseInfoDs}
            columns={3}
            readOnly
            fields={fields}
          />
        </Spin>
      </SecondCard>
      <SecondCard title={intl.get('smodr.invoice.view.invoiceLineInfo').d('开票行商品信息')} showDivide>
        <Table
          customizedCode='invoice-sku-info'
          dataSet={invoiceSkuDs}
          columns={getColumns('sku')}
        />
      </SecondCard>
      <SecondCard title={intl.get('smodr.invoice.view.invoiceAddInfo').d('开票行附加费信息')} showDivide>
        <Table
          customizedCode='invoice-freight-info'
          dataSet={invoiceAddFreightDs}
          columns={getColumns('freight')}
        />
      </SecondCard>
      <SecondCard title={intl.get('smodr.invoice.view.billInfo').d('发票信息')}>
        <Table
          customizedCode='invoice-info'
          dataSet={invoiceDs}
          columns={getColumns('invoice')}
        />
      </SecondCard>
    </>
  );
}

export default formatterCollections({
  code: [
    'smodr.invoice',
    'smodr.common',
  ],
})(Detail);
