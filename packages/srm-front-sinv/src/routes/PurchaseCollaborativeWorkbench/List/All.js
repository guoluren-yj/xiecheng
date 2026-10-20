import React from 'react';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import intl from 'utils/intl';
import { useAsnNumRender, useColorRender } from '../hooks';
import MultiTextFilter from '../components/MultipleTextField';
import '../index.less';
import { handleQuery, handleReset } from '../utils';

export default function AllList(props) {
  const { allDs, history, activeKey, customizeTable, sureSupplier, location } = props;
  const columns = [
    {
      name: 'invStatus',
      align: 'left',
      width: 160,
      renderer: useColorRender(),
    },
    {
      name: 'displayInvNum',
      align: 'left',
      width: 170,
      renderer: useAsnNumRender(history, activeKey, sureSupplier),
    },
    {
      name: 'processFactory',
      align: 'left',
      width: 120,
      renderer: ({ record }) => <span>{record.get('strategyName')}</span>,
    },
    {
      name: 'supplierNum',
      align: 'left',
      width: 140,
    },
    {
      name: 'supplierName',
      width: 180,
      renderer: ({ record }) => <span>{record.get('displaySupplierName') || ''}</span>,
    },
    {
      name: 'companyName',
      width: 180,
    },
    {
      name: 'sourceCode',
      width: 80,
    },
    {
      name: 'creationName',
      width: 120,
    },
    {
      name: 'creationDate',
      width: 150,
      type: 'dateTime',
    },
    {
      name: 'invDateLov',
      width: 150,
      type: 'dateTime',
    },
  ];
  return (
    <div style={{ height: 'calc(100vh - 252px)' }}>
      {customizeTable(
        {
          code: sureSupplier
            ? 'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.ALL.LIST'
            : 'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.ALL.LIST',
        },
        <SearchBarTable
          virtual
          virtualCell
          pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
          searchCode={
            sureSupplier
              ? 'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.ALL.SEARCH'
              : 'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.ALL.SEARCH'
          }
          cacheState
          dataSet={allDs}
          columns={columns}
          style={{ maxHeight: `calc(100% - 22px)` }}
          searchBarConfig={{
            onQuery: (params) => handleQuery(params, allDs, location, 'displayInvNums', history),
            onClear: () => handleReset(allDs),
            onReset: () => handleReset(allDs),
            left: {
              render: () => (
                <MultiTextFilter
                  name="displayInvNums"
                  dataSet={allDs}
                  placeholder={intl
                    .get('sinv.inventoryBench.view.button.queryDisplayNum')
                    .d('请输入单据编号查询')}
                />
              ),
            },
          }}
        />
      )}
    </div>
  );
}
