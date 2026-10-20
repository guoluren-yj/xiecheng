import React from 'react';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import intl from 'utils/intl';
import { useAsnNumRender, useColorRender } from '../hooks';
import MultiTextFilter from '../components/MultipleTextField';
import '../index.less';
import { handleQuery, handleReset } from '../utils';

export default function AllList(props) {
  const { detailallDs, history, customizeTable, sureSupplier, location } = props;
  const columns = [
    {
      name: 'invStatus',
      align: 'left',
      width: 160,
      renderer: useColorRender(),
    },
    {
      name: 'displayInvHeaderAndLineNum',
      align: 'left',
      width: 170,
      renderer: useAsnNumRender(history, 'all', sureSupplier),
    },
    {
      name: 'processFactory',
      align: 'left',
      width: 130,
      renderer: ({ record }) => <span>{record.get('strategyName') || '-'}</span>,
    },

    {
      name: 'invOrganizationId',
      align: 'left',
      width: 180,
      renderer: ({ record }) => <span>{record.get('organizationName') || '-'}</span>,
    },
    {
      name: 'itemCode',
      width: 120,
    },
    {
      name: 'itemName',
      width: 120,
    },
    {
      name: 'uomId',
      width: 80,
      renderer: ({ record }) => <span>{record.get('uomName') || '-'}</span>,
    },

    {
      name: 'quantity',
      width: 80,
      align: 'right',
      // renderer: ({ record }) =>
      //   record.get('processFactory') !== 1 ? <span>{record.get('quantity') || '-'}</span> : '-',
    },
    {
      name: 'affirmQuantity',
      width: 80,
      align: 'right',
      // renderer: ({ record }) =>
      //   record.get('processFactory') !== 1 ? (
      //     <span>{record.get('affirmQuantity') || '-'}</span>
      //   ) : (
      //     '-'
      //   ),
    },
    {
      name: 'inspectQuantity',
      width: 130,
      align: 'right',
    },
    {
      name: 'theoryQuantity',
      width: 130,
      align: 'right',
    },
    {
      name: 'inventoryVariance',
      width: 130,
      align: 'right',
    },
    {
      name: 'inventoryId',
      width: 80,
      renderer: ({ record }) => <span>{record.get('inventoryName') || '-'}</span>,
    },
    {
      name: 'locationId',
      width: 140,
      renderer: ({ record }) => <span>{record.get('locationName') || '-'}</span>,
    },
    {
      name: 'companyName',
      width: 180,
    },
    {
      name: 'displaySupplierName',
      width: 180,
    },
    {
      name: 'sourceNum',
      width: 180,
    },
    {
      name: 'lotNum',
      width: 120,
    },

    {
      name: 'sourceCode',
      width: 120,
      renderer: ({ record }) => <span>{record.get('sourceCodeMeaning') || '-'}</span>,
    },
    {
      name: 'creationDate',
      width: 150,
      type: 'dateTime',
    },
  ];
  return (
    <div style={{ height: 'calc(100vh - 252px)' }}>
      {customizeTable(
        {
          code: sureSupplier
            ? 'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.DETAIL.ALL.LIST'
            : 'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.DETAIL.ALL.LIST',
        },
        <SearchBarTable
          virtual
          virtualCell
          pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
          searchCode={
            sureSupplier
              ? 'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.DETAIL.ALL.SEARCH'
              : 'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.DETAIL.ALL.SEARCH'
          }
          cacheState
          dataSet={detailallDs}
          columns={columns}
          style={{ maxHeight: `calc(100% - 22px)` }}
          searchBarConfig={{
            onQuery: (params) =>
              handleQuery(params, detailallDs, location, 'displayInvHeaderAndLineNums', history),
            onClear: () => handleReset(detailallDs),
            onReset: () => handleReset(detailallDs),
            left: {
              render: () => (
                <MultiTextFilter
                  name="displayInvHeaderAndLineNums"
                  dataSet={detailallDs}
                  placeholder={intl
                    .get('sinv.inventoryBench.view.button.queryDisplayNumAndLine')
                    .d('请输入单据编号、单据编号-行号查询')}
                />
              ),
            },
          }}
        />
      )}
    </div>
  );
}
