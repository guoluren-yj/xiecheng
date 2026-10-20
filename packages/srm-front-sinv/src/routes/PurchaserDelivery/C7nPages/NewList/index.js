import React, { Fragment } from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import intl from 'utils/intl';
import moment from 'moment';
import { handleExectRecord, handleOperationRecord } from '../../utils';

const DeliveryList = (props) => {
  const { ds, customizeTable, handleToDetail } = props;

  const columns = [
    {
      name: 'asnStatusMeaning',
      width: 120,
      // renderer: ({ record }) => colorRender(record, 'asnStatus'),
    },
    {
      name: 'asnNum',
      width: 180,
      renderer: ({ value, record }) => {
        const renderCount =
          record.get('unReadCount') > 99 ? (
            <span style={{ marginLeft: 4, marginRight: 4, color: 'red' }}>(99+)</span>
          ) : (
            <span style={{ marginLeft: 4, marginRight: 4, color: 'red' }}>
              ({record.get('unReadCount')})
            </span>
          );
        return (
          <div>
            <a onClick={() => handleToDetail(record)}>{value}</a>
            {record.get('unReadCount') > 0 ? (
              <Tooltip
                title={
                  intl.get(`sinv.common.model.common.unReadCount`).d(`未读消息:`) +
                  record.get('unReadCount')
                }
              >
                {renderCount}
              </Tooltip>
            ) : null}
          </div>
        );
      },
    },
    {
      name: 'cancelStatusMeaning',
      width: 120,
    },
    {
      name: 'asnTypeCodeMeaning',
      width: 120,
    },
    {
      name: 'supplierCompanyName',
      width: 180,
    },
    {
      name: 'companyName',
      width: 180,
    },
    {
      name: 'creationDate',
      width: 150,
    },
    {
      name: 'shipDate',
      width: 150,
    },
    {
      name: 'expectedArriveDate',
      width: 180,
    },
    {
      name: 'organizationName',
      width: 150,
    },
    {
      name: 'shipToLocationAddress',
      width: 150,
    },
    {
      name: 'actualReceiverName',
      width: 100,
    },
    {
      name: 'purchaseAgentName',
      width: 100,
    },
    {
      name: 'createByName',
    },
    {
      name: 'submitSyncStatusMeaning',
      width: 150,
      renderer: ({ record }) => (
        <a onClick={() => handleExectRecord(record)}>
          {record.get('submitSyncStatus') === 'FAIL' ? (
            <span style={{ color: 'red' }}>{record.get('submitSyncStatusMeaning')}</span>
          ) : (
            <span>{record.get('submitSyncStatusMeaning')}</span>
          )}
        </a>
      ),
    },
    {
      name: 'erpAsnNum',
      width: 150,
    },
    {
      name: 'dataSourceCode',
      width: 100,
      renderer: ({ record }) => (
        <a onClick={() => handleOperationRecord(record.get('asnHeaderId'))}>
          {intl.get('sinv.common.model.common.operationRecord').d('操作记录')}
        </a>
      ),
    },
    {
      name: 'expressNum',
      width: 150,
    },
  ];

  return (
    <Fragment>
      <div style={{ height: 'calc(100vh - 260px)' }}>
        {customizeTable(
          {
            code: 'SINV.PURCHASER_DELIVERY_LIST.GRID',
          },
          <SearchBarTable
            searchCode="SINV.PURCHASER_DELIVERY.SEARCH.ALL_SEARCH"
            cacheState
            dataSet={ds}
            columns={columns}
            pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'] }}
            style={{ maxHeight: `calc(100% - 22px)` }}
            searchBarConfig={{
              fieldDefaultValueType: 'custom',
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
    </Fragment>
  );
};

export default DeliveryList;
