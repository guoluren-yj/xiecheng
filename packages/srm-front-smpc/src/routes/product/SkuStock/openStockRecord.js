import React from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from '_components/SearchBarTable';
// import { START_TIME_MOMENT, END_TIME_MOMENT } from '@/utils/const';

import { getStockRecordDs, getNewStockRecordDs } from './stockDs';

const StockRecordTable = withCustomize({ unitCode: ['SMPC.COMMODITY_INVENTORY.RECEIVE_RECORD'] })(
  (props) => {
    const { children, customizeTable } = props;
    return customizeTable({ code: 'SMPC.COMMODITY_INVENTORY.RECEIVE_RECORD' }, children);
  }
);

export default function openStockRecord(record, isSup, isReceive) {
  const { skuId, stockType, totalStock, inventoryId } = record.get([
    'skuId',
    'stockType',
    'totalStock',
    'inventoryId',
  ]);
  const ds = new DataSet(getStockRecordDs());
  ds.setQueryParameter('skuId', skuId);
  ds.setQueryParameter('stockType', stockType);
  ds.setQueryParameter('inventoryId', inventoryId);
  const code = isSup
    ? 'SMPC.COMMODITY_INVENTORY_SUP.RECORD.SEARCHBAR'
    : 'SMPC.COMMODITY_INVENTORY.RECORD.SEARCHBAR';
  if (isReceive) {
    ds.setQueryParameter('customizeUnitCode', `SMPC.COMMODITY_INVENTORY.RECEIVE_RECORD, ${code}`);
  } else {
    ds.setQueryParameter('customizeUnitCode', code);
  }
  // ds.query();
  const columns = [
    {
      name: 'realName',
      width: 120,
    },
    {
      name: 'operationCodeMeaning',
      width: 120,
    },
    {
      name: 'quantity',
      width: 120,
    },
    {
      name: 'availableStock',
      width: 120,
      renderer: ({ value }) =>
        totalStock === -1 ? intl.get('smpc.product.model.noLimitStock').d('无限库存') : value,
    },
    {
      name: 'operationTime',
      width: 160,
    },
    {
      name: 'remarkMeaning',
      width: 150,
    },
  ];
  const title = intl.get('smpc.product.view.title.stockRecord').d('库存记录');

  const recordTable = (
    <SearchBarTable
      dataSet={ds}
      searchCode={code}
      columns={columns}
      // queryFieldsLimit={2}
      // queryFields={{
      //   creatimeDateFrom: <DateTimePicker defaultTime={START_TIME_MOMENT} />,
      //   creatimeDateTo: <DateTimePicker defaultTime={END_TIME_MOMENT} />,
      // }}
      style={{ maxHeight: `calc(100vh - 160px)` }}
      searchBarConfig={{
        expandable: false,
        closeFilterSelector: true,
      }}
    />
  );

  Modal.open({
    title,
    drawer: true,
    style: { width: 742 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children: isReceive ? <StockRecordTable>{recordTable}</StockRecordTable> : recordTable,
  });
}

function openNewStockRecord(param) {
  const ds = new DataSet(getNewStockRecordDs());
  for (const key in param) {
    if (key) ds.setQueryParameter(key, param[key]);
  }
  ds.setQueryParameter('customizeUnitCode', 'SMPC.WORKBENCH_PUR.RECEIVE.NEW.STOCK_RECORD');
  // ds.query();
  const columns = [
    {
      name: 'operationUserName',
      width: 110,
    },
    {
      name: 'operationTime',
      width: 150,
    },
    {
      name: 'transactionTypeMeaning',
      width: 110,
    },
    { name: 'operationTypeMeaning', width: 110 },
    {
      name: 'modifiedNum',
      width: 100,
    },
    {
      name: 'sourceCode',
      width: 200,
      minWidth: 200,
      title: intl.get('smpc.workbench.view.sourceCodeAndLine').d('来源单据号-行号'),
      renderer: ({ record }) => {
        const { sourceCode, sourceLineCode } = record.get(['sourceCode', 'sourceLineCode']);
        return sourceCode ? `${sourceCode} - ${sourceLineCode}` : '-';
      },
    },
    {
      name: 'remark',
      // width: 150,
    },
  ];
  const title = intl.get('smpc.product.view.title.stockRecord').d('库存记录');

  const recordTable = (
    <SearchBarTable
      dataSet={ds}
      searchCode="SMPC.WORKBENCH_PUR.RECEIVE.NEW.STOCK_RECORD"
      customizedCode="SMPC.COMMODITY_INVENTORY.NEW_RECEIVE_STOCK_RECORD"
      style={{ maxHeight: `calc(100vh - 160px)` }}
      columns={columns}
      searchBarConfig={{
        expandable: false,
        closeFilterSelector: true,
      }}
    />
  );

  Modal.open({
    title,
    drawer: true,
    style: { width: 1090 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children: recordTable,
  });
}

export { openNewStockRecord };
