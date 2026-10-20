import React from 'react';

import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import { dsFieldsMap } from './data';


function SubTable(props) {

  const { parentKey, subKey, singleConfig, ds, customizeTable } = props;

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {
        singleConfig.customReal ? customizeTable({
          code: singleConfig.customizedCode,
        }, (
          <SearchBarTable
            style={{ maxHeight: `calc(100% - 22px)` }}
            dataSet={ds}
            columns={dsFieldsMap(subKey)[parentKey]}
            customizedCode={singleConfig.customizedCode}
            searchCode={singleConfig.searchCode}
          />
        )) : (
          <SearchBarTable
            style={{ maxHeight: `calc(100% - 22px)` }}
            dataSet={ds}
            columns={dsFieldsMap(subKey)[parentKey]}
            customizedCode={singleConfig.customizedCode}
            searchCode={singleConfig.searchCode}
          />
        )
      }
    </div>
  );
}

export default SubTable;
