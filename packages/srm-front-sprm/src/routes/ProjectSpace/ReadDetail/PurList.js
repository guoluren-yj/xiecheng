import React, { useContext } from 'react';
import SearchBarTable from '_components/SearchBarTable';
import intl from 'utils/intl';
import { Store } from '../commonDetail/sotreProvider';
import { colorTagRender } from '../commonDetail/util.js';

const PurList = ({ type = 'tabs', purModalDs, custTable, searchCode, tabCode, store }) => {
  const { headerDs, purListDs, customizeTable: storeCustTable, remote } =
    useContext(Store) || store;
  const dataSet = type === 'tabs' ? purListDs : purModalDs;
  const customizeTable = type === 'tabs' ? storeCustTable : custTable;
  const cols = [
    { name: 'virtualLineNum' },
    { name: 'cancelStatus', renderer: colorTagRender },
    { name: 'itemId' },
    { name: 'itemName' },
    { name: 'categoryId' },
    { name: 'model' },
    { name: 'specifications' },
    { name: 'quantity' },
    { name: 'estimatedUnitPrice' },
    { name: 'estimatedLineAmount' },
    { name: 'unitPriceBatch' },
    { name: 'taskLevel' },
    { name: 'taskNum', width: 180 },
    { name: 'demandDate' },
    { name: 'uomId' },
    { name: 'sourceDocument' },
    { name: 'remark' },
  ];
  const tableProps = remote.process(
    'SPRM_PROJECT_DETAIL_PURLIST_TABLE_PROPS',
    {
      dataSet,
      columns:
        type !== 'tabs' ? cols.filter(e => !['taskNum', 'taskLevel'].includes(e.name)) : cols,
    },
    {
      type,
      headerDs,
    }
  );
  return (
    <div className="content-padding">
      {type === 'tabs' && (
        <h3 className="content-title">
          {intl.get(`sprm.project.model.common.purPartsList`).d('采购件清单')}
        </h3>
      )}
      {customizeTable(
        {
          code: tabCode || 'SIEC.PROJECT_READ.PUR_LIST',
        },
        <SearchBarTable
          cacheState
          style={{ maxHeight: `calc(100vh - 300px)` }}
          searchCode={searchCode || 'SIEC.PROJECT_READ.PURLIST_FILTER'}
          searchBarConfig={{
            autoQuery: false,
            closeFilterSelector: true,
          }}
          {...tableProps}
        />
      )}
    </div>
  );
};

export default PurList;
