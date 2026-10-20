import React, { useContext } from 'react';
import { Table } from 'choerodon-ui/pro';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { DetailCustomizeCode } from '../../utils/type';

const CuszLineSlot = () => {
  const {
    viewFlag,
    cuszLineDs,
    customizeTable,
  } = useContext<StoreValueType>(Store);

  return customizeTable(
    {
      code: DetailCustomizeCode.CuszLineTableCode,
      readOnly: viewFlag,
    },
    <Table
      columns={[]}
      dataSet={cuszLineDs}
      style={{ maxHeight: 430 }}
    />
  );
};

export default CuszLineSlot;
