import React from 'react';
import SearchBarTable from '_components/SearchBarTable';

import { cuszLineUnitCodeMap } from '..';

const CuszLineSlot = (props) => {

  const { cuszLineDs, readOnlyFlag, customizeTable } = props;

  return customizeTable(
    {
      code: cuszLineUnitCodeMap.LIST,
      readOnly: readOnlyFlag,
    },
    <SearchBarTable
      columns={[]}
      dataSet={cuszLineDs}
      style={{ maxHeight: 620 }}
      searchCode={cuszLineUnitCodeMap.SEARCH}
      searchBarConfig={{ closeFilterSelector: true }}
    />
  );
};

export default CuszLineSlot;
