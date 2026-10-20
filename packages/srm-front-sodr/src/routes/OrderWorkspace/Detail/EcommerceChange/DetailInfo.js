/*
 * BasicInfo - 订单明细页-明细信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useMemo } from 'react';

import DocFlow from '_components/DocFlow';
import SearchBarTable from '_components/SearchBarTable';

import CategoryLov from '@/routes/components/CategoryLov';
import CustomSpecsModal from '@/routes/components/CustomSpecsModal';
import { renderStatus } from '@/routes/components/utils';

const DetailInfo = (props) => {
  const { ds, customizeTable, displayDocAndDocFlow = {}, remote } = props;
  const doubleUnitEnabled = ds.getState('doubleUnitEnabled');

  const columns = useMemo(() => {
    const lineColumns = [
      {
        name: 'displayStatusCode',
        width: 120,
        renderer: ({ record }) =>
          renderStatus(record.get('displayStatusCode'), record.get('displayStatusMeaning')),
      },
      {
        name: 'displayLineNum',
        width: 70,
      },
      {
        name: 'displayLineLocationNum',
        width: 100,
      },
      {
        name: 'productNum',
        width: 150,
        editor: true,
      },
      {
        name: 'productName',
        width: 180,
        editor: true,
      },
      {
        name: 'catalogName',
        width: 150,
        editor: true,
      },
      {
        name: 'itemId',
        width: 150,
        editor: true,
      },
      {
        name: 'itemName',
        width: 150,
        editor: true,
      },
      {
        name: 'secondaryUomId',
        width: 150,
        editor: true,
      },
      {
        name: 'secondaryQuantity',
        width: 150,
        editor: true,
      },
      doubleUnitEnabled && {
        name: 'quantity',
        width: 150,
        editor: true,
      },
      doubleUnitEnabled && {
        name: 'uomId',
        width: 150,
        editor: true,
      },
      {
        name: 'needByDate',
        width: 150,
        editor: true,
      },
      {
        name: 'unitPrice',
        width: 150,
        editor: true,
      },
      {
        name: 'enteredTaxIncludedPrice',
        width: 150,
        editor: true,
      },
      {
        name: 'taxId',
        width: 150,
        editor: true,
      },
      // {
      //   name: 'lastPurchasePrice',
      //   width: 150,
      //   renderer: ({ value }) => numberRender(value),
      // },
      {
        name: 'unitPriceBatch',
        width: 150,
        editor: true,
      },
      {
        name: 'currencyCode',
        width: 150,
        editor: true,
      },
      {
        name: 'categoryId',
        width: 150,
        editor: (record) => <CategoryLov data={{ record, ds }} />,
      },
      {
        name: 'invOrganizationId',
        width: 150,
        editor: true,
      },
      {
        name: 'invInventoryId',
        width: 150,
        editor: true,
      },
      {
        name: 'invLocationId',
        width: 150,
        editor: true,
      },
      {
        name: 'shipToThirdPartyAddress',
        width: 150,
        editor: true,
      },
      {
        name: 'shipToThirdPartyContact',
        width: 150,
        editor: true,
      },
      {
        name: 'departmentId',
        width: 150,
        editor: true,
      },
      {
        name: 'costId',
        width: 150,
        editor: true,
      },
      {
        name: 'projectCategory',
        width: 150,
        editor: true,
      },
      {
        name: 'displayPrNumAndDisplayPrLineNum',
        width: 180,
      },
      {
        name: 'prRequestedName',
        width: 150,
        renderer: ({ record }) => record.get('purReqAppliedName'),
      },
      {
        name: 'remark',
        width: 150,
        editor: true,
      },
      {
        name: 'attachmentUuid',
        width: 150,
        editor: true,
      },
      // 默认隐藏字段
      {
        name: 'skuType',
        width: 120,
      },
      {
        name: 'customUomName',
        width: 120,
      },
      {
        name: 'customQuantity',
        width: 120,
      },
      {
        name: 'packageQuantity',
        width: 120,
      },
      {
        name: 'customSpecsJson',
        width: 120,
        renderer: ({ value }) => (
          <CustomSpecsModal type="customSpecs" data={value ? JSON.parse(value) : []} />
        ),
      },
      {
        name: 'customSpecs',
        width: 150,
      },
      {
        name: 'productSpecsJson',
        width: 120,
        renderer: ({ value }) => (
          <CustomSpecsModal type="productSpecs" data={value ? JSON.parse(value) : []} />
        ),
      },
      {
        name: 'productBrand',
        width: 150,
      },
      {
        name: 'productModel',
        width: 150,
      },
      {
        name: 'packingList',
        width: 150,
      },
      {
        name: 'productSpecs',
        width: 150,
      },
      {
        name: 'accountSubjectId',
        width: 150,
        editor: true,
      },
      {
        name: 'wbsCode',
        width: 150,
        editor: true,
      },
      {
        name: 'receiveTelNum',
        width: 400,
        editor: true,
        // editor: (record) => {
        //   return <TextField addonBefore={<Select record={record} name="internationalTelCode" />} />;
        // },
        // renderer: ({ record, text }) =>
        //   [record.get('internationalTelCode'), text].filter(Boolean).join('-'),
      },
      {
        name: 'brand',
        width: 150,
        editor: true,
      },
      {
        name: 'specifications',
        width: 150,
        editor: true,
      },
      {
        name: 'model',
        width: 150,
        editor: true,
      },
      {
        name: 'accountAssignTypeId',
        width: 150,
        editor: true,
      },
      {
        name: 'domesticUnitPrice',
        width: 150,
      },
      {
        name: 'domesticLineAmount',
        width: 150,
      },
      {
        name: 'domesticTaxIncludedPrice',
        width: 150,
      },
      {
        name: 'domesticTaxIncludedLineAmount',
        width: 150,
      },
      {
        name: 'docFlow',
        width: 100,
        hidden: displayDocAndDocFlow.displayDocFlow !== '1',
        renderer: ({ record }) => (
          <DocFlow tableName="sodr_po_line_location" tablePk={record.get('poLineLocationId')} />
        ),
      },
    ];
    return remote.process('processColumns', lineColumns);
  }, [doubleUnitEnabled, displayDocAndDocFlow, ds]);
  return customizeTable(
    {
      code: 'SODR.WORKSPACE_EC_CHANGE_DETAIL.DETAILINFO',
      __force_record_to_update__: true,
    },
    <SearchBarTable
      searchCode="SODR.WORKSPACE_EC_CHANGE_DETAIL.DETAILINFO_FILTER"
      dataSet={ds}
      columns={columns}
      selectionMode="none"
      pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
      style={{ maxHeight: `calc(100vh - 400px)` }}
      virtual
      virtualCell
      searchBarConfig={{
        // autoQuery: false,
        checkDataSetStatus: false,
        closeFilterSelector: true,
      }}
    />
  );
};

export default DetailInfo;
