import React, { useMemo, useEffect, useRef } from 'react';
import { DataSet } from 'choerodon-ui/pro';

import SearchBarTable from '_components/SearchBarTable';
import TextFieldPro from '@/routes/components/TextFieldPro';
import intl from 'utils/intl';

import { initDs } from './tableDs';

function CreateBills(props) {
  const queryRef = useRef(undefined);
  // const tableDS = useMemo(() => new DataSet(initDs()), []);
  const { tableDS } = props;

  // useEffect(() => {
  //   props.onRef(tableDS);
  // }, [tableDS]);

  // const tableDS = useMemo(() => new DataSet(initDs()), []);

  const columns = useMemo(
    () => [
      { name: 'pickCode', width: 200 },
      { name: 'pickSourceFromMeaning' },
      { name: 'outsideOrderCode', width: 150 },
      { name: 'skuCode', width: 150 },
      { name: 'skuName' },
      { name: 'uomName', hidden: true },
      { name: 'quantityMeaning', align: 'right' },
      { name: 'taxRate', hidden: true, align: 'right' },
      { name: 'currencyName' },
      { name: 'unitPriceMeaning', align: 'right', width: 120 },
      { name: 'proxyUnitPriceMeaning', hidden: true, align: 'right', width: 120 },
      { name: 'entryAmountMeaning', align: 'right', width: 120 },
      { name: 'proxyEntryAmountMeaning', hidden: true, align: 'right', width: 120 },
      { name: 'machineCode', hidden: true },
      { name: 'pickerName' },
      { name: 'purchaseCompanyName', width: 200 },
      { name: 'proxySupplierCompanyName', width: 200 },
      { name: 'supplierCompanyName', width: 200 },
      { name: 'pickCreatedTime', width: 150 },
      { name: 'remark' },
    ],
    []
  );

  return (
    <>
      <SearchBarTable
        style={{ maxHeight: `calc(100vh - 190px)` }}
        searchCode="SMODR.ORDER.ENTRY.PICK.QUERY"
        customizedCode="SMODR.ORDER.ENTRY.PICK.SELECT"
        dataSet={tableDS}
        columns={columns}
        searchBarConfig={{
          left: {
            render: () => (
              <TextFieldPro
                ds={tableDS}
                placeholder={intl
                  .get('smodr.orderLine.bill.searchTips')
                  .d('请输入商城领料记录编码、电商领料记录编码查询')}
                name="mergeQuery"
                onRef={(ref) => {
                  queryRef.current = ref;
                }}
              />
            ),
          },
          onReset: () => {
            if (queryRef.current) {
              queryRef.current.handleClear();
            }
          },
          onClear: () => {
            if (queryRef.current) {
              queryRef.current.handleClear();
            }
          },
        }}
      />
    </>
  );
}

export default CreateBills;
