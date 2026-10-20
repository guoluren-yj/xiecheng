import React, { useContext } from 'react';
import { CustModal } from '@/routes/components/C7nCustomModal';
import ImageList from '@/routes/components/ImageList';
import { Store } from './index';
import { useUomRender, useYesOrNoRender, useLanguageRender, useTable } from '../hooks';

function BaseInfo() {
  const { baseInfoDs, customizeTable, editFlag } = useContext(Store);
  const columns = [
    {
      name: 'asnLineNum',
      align: 'left',
      width: 100,
    },
    {
      name: 'itemCode',
      width: 120,
    },
    {
      name: 'categoryName',
      width: 110,
      fixed: 'left',
    },
    {
      name: 'itemName',
      align: 'left',
      width: 110,
      fixed: 'left',
    },
    {
      name: 'supplierItemNum',
      width: 110,
    },
    {
      name: 'supplierItemDesc',
      width: 130,
    },
    {
      name: 'cancelledFlag',
      align: 'left',
      width: 100,
      renderer: useYesOrNoRender(),
    },
    {
      name: 'closedFlag',
      align: 'left',
      width: 100,
      renderer: useYesOrNoRender(),
    },
    {
      name: 'shipQuantity',
      align: 'left',
      width: 120,
    },
    {
      name: 'grossWeightStandard',
      width: 120,
      align: 'right',
      renderer: useLanguageRender(),
    },
    {
      name: 'netWeightStandard',
      width: 120,
      align: 'right',
    },
    {
      name: 'weightUomName',
      width: 120,
      renderer: useUomRender('weightUom'),
    },
    {
      name: 'uomName',
      width: 90,
      renderer: useUomRender(),
    },
    {
      name: 'receiveStatusMeaning',
      align: 'left',
      width: 130,
    },
    {
      name: 'receiveQuantity',
      width: 140,
      renderer: useLanguageRender(),
    },
    {
      name: 'displayPoNum',
      width: 150,
      align: 'left',
    },
    {
      name: 'displayReleaseNum',
      width: 140,
      align: 'left',
    },
    {
      name: 'displayLineNum',
      width: 150,
      align: 'left',
    },
    {
      name: 'displayLineLocationNum',
      width: 120,
      align: 'left',
    },

    {
      name: 'versionNum',
      width: 70,
      align: 'left',
    },
    {
      name: 'batchNo',
      width: 150,
    },
    {
      name: 'lotNum',
      width: 150,
    },
    {
      name: 'neededDate',
      width: 130,
    },
    {
      name: 'promisedDate',
      align: 'left',
      width: 150,
    },
    {
      name: 'purchaseAgentName',
      width: 100,
      align: 'left',
    },
    {
      name: 'inventoryName',
      width: 100,
      align: 'left',
    },
    {
      name: 'locationName',
      width: 100,
      align: 'left',
    },
    {
      name: 'productionOrderNum',
      width: 120,
      align: 'left',
    },
    {
      name: 'contactInfo',
      width: 100,
      align: 'left',
    },
    {
      name: 'productNum',
      align: 'left',
      width: 190,
    },
    {
      name: 'productName',
      align: 'left',
      width: 90,
    },
    {
      name: 'catalogName',
      align: 'left',
      width: 90,
    },
    {
      name: 'purchaseRemark',
      width: 110,
      align: 'left',
    },
    {
      name: 'approveAttachmentUuid',
      width: 130,
    },
    {
      name: 'reviewAttachmentUuid',
      width: 130,
    },
    {
      name: 'otherAttachmentUuid',
      width: 130,
    },
    // {
    //   name: 'attachmentUuid',
    //   width: 130,
    // },
    {
      name: 'supplierRemark',
      width: 110,
    },
    // {
    //   name: 'tag',
    //   width: 110,
    // },
    {
      name: 'attachmentUuid',
      width: 120,
    },
    {
      name: 'customSpecsJson',
      width: 120,
      renderer: ({ value }) => {
        return <CustModal dataSource={value ? JSON.parse(value) : []} />;
      },
    },
    {
      name: 'attachmentUrlList',
      width: 100,
      renderer: ({ value }) => {
        return <ImageList imageDTO={(value && value.slice()) || []} />;
      },
    },
  ];

  return useTable(baseInfoDs, columns, customizeTable, {
    code: 'SINV.SUPPLIER_DELIVERY.DETAIL.BASIC_C7N',
    editFlag,
  });
}

export default BaseInfo;
