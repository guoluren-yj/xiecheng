import React from 'react';
// import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { Table } from 'choerodon-ui/pro';

export default function InvertoryList(props) {
  const { InvertoryDs, customizeTable } = props;

  const columns = [
    {
      name: 'companyName',
      width: 150,
    },
    {
      name: 'organizationName',
      width: 140,
    },
    {
      name: 'supplierNum',
      width: 120,
    },
    {
      name: 'supplierName',
      width: 120,
    },
    {
      name: 'itemCode',
      width: 170,
    },
    {
      name: 'itemName',
      width: 220,
    },
    {
      name: 'uomName',
      width: 90,
    },

    {
      name: 'stockQuantity',
      width: 120,
    },
    {
      name: 'lotNum',
      width: 120,
    },

    {
      name: 'inventoryName',
      width: 140,
    },
    {
      name: 'locationName',
      width: 140,
    },
  ];

  return customizeTable(
    {
      code: 'SINV-SUPPLIER-INVENTORY-QUERY.LIST',
    },
    <Table dataSet={InvertoryDs} style={{ maxHeight: `calc(100% - 22px)` }} columns={columns} />
  );
}
