import React, { useRef, useState } from 'react';

import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import TextFieldPro from '@/routes/components/TextFieldPro';
import ViewFilter from '@/components/ViewFilter';
import intl from 'utils/intl';
import { useShowDoc } from '@/components/ShowDoc/index.ts';

import { columnsMap } from './dataSource';

function SubTable(props) {

  const { parentKey, subKey, singleConfig, ds, history, customizeTable } = props;
  const queryRef = useRef(undefined);
  const [aggregation, setAggregation] = useState(false);
  const showDocFlow = useShowDoc();

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        {
          code: singleConfig.customizedTableCode,
        },
        <SearchBarTable
          style={{ maxHeight: `calc(100% - 22px)` }}
          dataSet={ds}
          cacheState
          aggregation={aggregation}
          onAggregationChange={(_aggregation) => {
            setAggregation(_aggregation);
          }}
          columns={columnsMap(subKey, history, aggregation, showDocFlow)[parentKey]}
          searchCode={singleConfig.searchCode}
          searchBarConfig={{
            left: {
              render: () => {
                const flag = parentKey === 'whole';
                return (
                  <TextFieldPro
                    ds={ds}
                    placeholder={flag ? intl
                      .get('smodr.apply.model.query')
                      .d('请输入商城申请编码查询') :
                      intl
                        .get('smodr.apply.model.lineQuery')
                        .d('请输入商城申请编码-行号查询')}
                    name={flag ? 'requestCodes' : 'requestCodeLines'}
                    onRef={(ref) => {
                      queryRef.current = ref;
                    }}
                  />
                );
              },
            },
            right: {
              render: () => parentKey === 'detail' ? (
                <ViewFilter
                  aggregation={aggregation}
                  onAggregationChange={(_aggregation) => {
                    setAggregation(_aggregation);
                  }}
                />
              ) : '',
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
      )}
    </div>
  );
}

export default SubTable;
