import React from 'react';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { getCurrentTenant } from 'utils/utils';
import moment from 'moment';
import { useTooltip, useAsnNumRender, useBadgeRender, useOperationRecord } from './hooks';
import './index.less';

export default function DeliveryList(props) {
  const { wholeDs, customizeTable, history } = props;
  const tenantName = getCurrentTenant().tenantNum;
  const columns = [
    {
      name: 'asnStatusMeaning',
      align: 'left',
      width: 90,
    },
    {
      name: 'asnNum',
      align: 'left',
      width: 170,
      renderer: useAsnNumRender(history, 'list'),
    },
    {
      name: 'printStatusFlag',
      align: 'left',
      width: 80,
      renderer: useBadgeRender(),
    },
    {
      name: 'asnTypeCodeMeaning',
      align: 'left',
      width: 140,
    },
    {
      name: 'supplierCompanyName',
      width: 150,
      align: 'left',
    },
    {
      name: 'companyName',
      width: 180,
      align: 'left',
    },
    {
      name: 'creationDate',
      width: 150,
      align: 'left',
    },
    {
      name: 'shipDate',
      align: 'left',
      width: 150,
    },
    {
      name: 'expectedArriveDate',
      align: 'left',
      width: 150,
      type: 'dateTime',
    },
    {
      name: 'organizationName',
      width: 150,
      align: 'left',
    },
    {
      name: 'shipToLocationAddress',
      renderer: useTooltip({ placement: 'topLeft' }),
    },
    {
      name: 'actualReceiverName',
      width: 150,
    },
    {
      name: 'purchaseAgentName',
      width: 120,
    },
    {
      name: 'createByName',
      width: 100,
    },
    {
      name: 'cancelStatusMeaning',
      width: 120,
    },
    {
      name: 'submitSyncStatusMeaning',
      align: 'left',
      width: 150,
    },
    {
      name: 'erpAsnNum',
      width: 400,
      renderer: useTooltip(),
    },
    {
      name: 'dataSourceCode',
      width: 100,
      renderer: useOperationRecord(),
    },
    {
      name: 'expressNum',
      width: 150,
    },
  ];
  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        {
          code: 'SINV.SUPPLIER_DELIVERY_LIST.GRID',
        },
        <SearchBarTable
          searchCode="SINV.SUPPLIER_DELIVERY_LIST.NEW_FILTER"
          cacheState
          dataSet={wholeDs}
          columns={columns}
          style={{ maxHeight: `calc(100% - 22px)` }}
          searchBarConfig={{
            fieldDefaultValueType: 'custom',
            editorProps: {
              asnStatus: {
                optionsFilter:
                  tenantName === 'SRM-SQUIRRELS'
                    ? true
                    : (record) => record.get('value') !== 'CONFIRMED',
              },
            },
            fieldProps: {
              creationDateFrom: {
                defaultValue: () => moment().subtract(1, 'quarters'),
              },
              creationDateTo: {
                defaultValue: () => moment(),
              },
            },
          }}
        />
      )}
    </div>
  );
}
