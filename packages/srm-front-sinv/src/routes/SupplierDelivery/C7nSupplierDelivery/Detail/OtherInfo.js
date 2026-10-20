import { useContext } from 'react';
import { useBomModal, useLanguageRender, useTable } from '../hooks';
import { Store } from './index';

function OtherInfo() {
  const { otherInfoDs, customizeTable, editFlag } = useContext(Store);
  const columns = [
    {
      name: 'asnLineNum',
      width: 110,
    },
    {
      name: 'itemCode',
      width: 110,
    },
    {
      name: 'categoryName',
      width: 110,
    },
    {
      name: 'itemName',
      width: 110,
    },
    {
      name: 'productionDate',
      align: 'left',
      width: 150,
    },
    {
      name: 'shelfLife',
      align: 'left',
      width: 150,
    },
    {
      name: 'lotExpirationDate',
      align: 'left',
      width: 150,
    },
    {
      name: 'unitPackageQuantity',
      align: 'left',
      width: 110,
      renderer: useLanguageRender(),
    },
    {
      name: 'packageQuantity',
      align: 'left',
      width: 100,
      renderer: useLanguageRender(),
    },
    {
      name: 'remainderQuantity',
      align: 'left',
      width: 110,
      renderer: useLanguageRender(),
    },
    {
      name: 'serialNum',
      width: 100,
    },
    {
      name: 'invoiceNum',
      width: 90,
    },
    {
      name: 'oldItemCode',
      width: 90,
    },
    {
      name: 'supplierItemCode',
      width: 110,
    },
    {
      name: 'supplierItemName',
      width: 110,
    },
    {
      name: 'bom',
      width: 120,
      renderer: useBomModal(),
    },
  ];

  return useTable(otherInfoDs, columns, customizeTable, {
    code: 'SINV.SUPPLIER_DELIVERY.DETAIL.OTHER',
    editFlag,
  });
}

export default OtherInfo;
