import React, { useMemo } from 'react';
import type { DataSet } from 'choerodon-ui/pro';
import { Table } from 'choerodon-ui/pro';
import { getCuszCode } from './type';
import type { DocType } from './storeDS';


interface InvoiceLineProps {
  docType: DocType,
  invoiceLineDs: DataSet,
  customizeTable: any,
}

const InvoiceLine = (props: InvoiceLineProps) => {

  const { docType, invoiceLineDs, customizeTable } = props;

  const CuszCode = getCuszCode(docType);

  const lineColumns = useMemo(() => {
    if (docType === 'taxInvoice') {
      return [
        { name: 'itemName', width: 240 },
        { name: 'netAmount', width: 150 },
        { name: 'quantity', width: 150 },
        { name: 'taxRate', width: 150 },
        { name: 'taxAmount', width: 150 },
        { name: 'taxIncludedPrice', width: 150 },
        { name: 'taxIncludedAmount', width: 150 },
        { name: 'netPrice', width: 150 },
        { name: 'specificationsModel', width: 150 },
        { name: 'uom', width: 150 },
        { name: 'plateNo', width: 150 },
        { name: 'trafficType', width: 150 },
        { name: 'trafficDateStart', width: 180 },
        { name: 'trafficDateEnd', width: 180 },
      ];
    } else if (docType === 'invoiceCheck') {
      return [
        { name: 'itemName', width: 240 },
        { name: 'amount', width: 150 },
        { name: 'quantity', width: 150 },
        { name: 'taxRate', width: 150 },
        { name: 'taxAmount', width: 150 },
        { name: 'taxIncludedAmount', width: 150 },
        { name: 'unitPrice', width: 150 },
        { name: 'specificationModel', width: 150 },
        { name: 'unit', width: 150 },
        { name: 'plateNo', width: 150 },
      ];
    }
    return [];
  }, [docType]);

  return customizeTable(
    { code: CuszCode.LineGridCode },
    <Table columns={lineColumns} dataSet={invoiceLineDs} style={{ maxHeight: 430 }} />
  );
};

export default InvoiceLine;