import React, { useEffect } from 'react';
import { Table } from 'choerodon-ui/pro';
import { showBigNumber } from '@/routes/components/utils';

export function Addlist(props) {
  const { asnHeaderId, addListDs } = props;

  useEffect(() => {
    addListDs.setQueryParameter('params', {
      asnHeaderId,
    });
    addListDs.query();
  }, []);

  const columns = [
    {
      name: 'itemCode',
      with: 120,
      fixed: 'left',
    },
    {
      name: 'itemName',
      with: 120,
      fixed: 'left',
    },
    {
      name: 'quantity',
      with: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'canAsnQuantity',
      with: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'uomName',
      with: 120,
      renderer: ({ record }) =>
        record.get('uomName') && record.get('uomCode') ? (
          <span>{`${record.get('uomCode')}/${record.get('uomName')}`}</span>
        ) : null,
    },
    {
      name: 'displayPoNum',
      with: 120,
    },
    {
      name: 'displayLineNum',
      with: 120,
    },
    {
      name: 'displayLineLocationNum',
      with: 120,
    },
    {
      name: 'releaseNum',
      with: 120,
    },
    {
      name: 'versionNum',
      with: 120,
    },
    {
      name: 'needByDate',
      with: 120,
    },
    {
      name: 'promiseDeliveryDate',
      with: 120,
    },
    {
      name: 'companyName',
      with: 120,
    },
    {
      name: 'shipToThirdPartyName',
      with: 120,
    },
  ];
  return (
    <Table
      columns={columns}
      dataSet={addListDs}
      queryFieldsLimit={3}
      style={{ maxHeight: `calc(100vh - 400px)` }}
      virtual
      virtualCell
    />
  );
}
