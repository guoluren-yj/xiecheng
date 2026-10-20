import React, { useRef } from 'react';

import SearchBarTable from '_components/SearchBarTable';
import intl from 'utils/intl';

import QueryField from './QueryField';


export default function SubTable({ dataSet, activeKey, searchCode, customizedCode, columns }) {
  const queryRef = useRef();

  return (
    <div style={{ height: 'calc(100vh - 245px)' }}>
      <SearchBarTable
        dataSet={dataSet}
        columns={columns}
        style={{ maxHeight: 'calc(100% - 22px)' }}
        searchCode={searchCode}
        customizedCode={customizedCode}
        cacheState
        searchBarConfig={{
          editorProps: {
            statusCode: {
              optionsFilter: (record) => {
                if (activeKey === 'NEW') return ['REJECTED', 'NEW'].includes(record.get('value'));
                if (activeKey === 'APPROVED') return ['APPROVED', 'WAITING_STORAGE'].includes(record.get('value'));
                if (activeKey === 'FINISHED') return ['COMPLETE'].includes(record.get('value'));
                return true;
              },
            },
          },
          left: {
            render: () => (
              <QueryField
                name="orderNums"
                dataSet={dataSet}
                onRef={(ref) => {
                  queryRef.current = ref;
                }}
                placeholder={intl.get('sstk.stockWorkbench.view.queryMsg.Inventory').d('请输入库存单号查询')}
              />
            ),
          },
          onReset: () => {
            if (queryRef.current.handleClear) queryRef.current.handleClear();
          },
          onClear: () => {
            if (queryRef.current.handleClear) {
              queryRef.current.handleClear();
            };
          },
        }}
      />
    </div>
  );
};