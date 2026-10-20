import React, { useMemo, useEffect } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { decimalPointAccuracy } from '@/routes/utils';
import { amountLocalRender } from '@/utils/utils';
import { taxLineDS as taxLineDs } from '../../../stores/SupplySettleDS';

const TaxDetailModal = (props) => {
  const { taxInvoiveHeaderId } = props;

  const taxLineDS = useMemo(() => {
    return new DataSet(taxLineDs());
  }, []);

  useEffect(() => {
    // taxLineDS.setQueryParameter('settleHeaderId', settleHeaderId);
    taxLineDS.setQueryParameter('taxInvoiveHeaderId', taxInvoiveHeaderId);

    taxLineDS.query();
  }, []);

  const columns = [
    {
      width: 150,
      name: 'lineNum',
    },
    {
      width: 150,
      name: 'itemCode',
    },
    {
      width: 150,
      name: 'itemName',
    },
    {
      width: 150,
      name: 'specificationsModel',
    },
    {
      width: 150,
      name: 'uom',
    },
    {
      width: 150,
      name: 'quantity',
      renderer: amountLocalRender,
    },
    {
      width: 150,
      name: 'netPrice',
      renderer: amountLocalRender,
    },
    {
      width: 150,
      name: 'netAmount',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      width: 150,
      name: 'taxIncludedAmount',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
    {
      width: 150,
      name: 'taxRate',
    },
    {
      width: 150,
      name: 'taxAmount',
      renderer: ({ value, record }) => {
        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
          repair: true,
          check: true,
        });
      },
    },
  ];

  return <Table columns={columns} dataSet={taxLineDS} />;
};

export default TaxDetailModal;
