import React, { useMemo } from 'react';
import type { DataSet } from 'choerodon-ui/pro';
import { Table } from 'choerodon-ui/pro';


interface InvoiceLineProps {
  invoiceLineDs: DataSet,
}

const InvoiceLine = (props: InvoiceLineProps) => {

  const { invoiceLineDs } = props;

  const lineColumns = useMemo(
    () => [
      {
        name: 'lineNum',
        width: 80,
      },
      {
        name: 'itemName',
        width: 240,
      },
      {
        name: 'netAmount',
        width: 150,
      },
      {
        name: 'quantity',
        width: 150,
      },

      {
        name: 'taxRate',
        width: 150,
      },

      {
        name: 'taxAmount',
        width: 150,
      },
      {
        name: 'taxIncludedPrice',
        width: 150,
      },
      {
        name: 'taxIncludedAmount;',
        width: 150,
      },
      {
        name: 'netPrice',
        width: 150,
      },
      {
        name: 'spec',
        width: 150,
      },
      {
        name: 'uom',
        width: 150,
      },
      {
        name: 'plateNo',
        width: 150,
      },
      {
        name: 'trafficType',
        width: 150,
      },
      {
        name: 'trafficDateStart',
        width: 150,
      },
      {
        name: 'trafficDateEnd',
        width: 150,
      },
    ],
    []
  );

  return (
    <Table columns={lineColumns} dataSet={invoiceLineDs} style={{ maxHeight: 430 }} />
  );
};

export default InvoiceLine;