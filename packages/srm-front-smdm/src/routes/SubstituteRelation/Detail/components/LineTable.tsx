import React, { useContext, useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import type { StoreValueType} from '../stores/StoreProvider';
import { Store } from '../stores/StoreProvider';
import { DetailCustomizeCode } from '../../utils/constant';

const LineTable = () => {
  const {
    lineDS,
    customizeTable,
  } = useContext(Store) as StoreValueType;

  const columns: ColumnProps[] = useMemo(() => {
    return [
      { name: 'displayLineNum' },
      { name: 'itemCode' },
      { name: 'itemName' },
      { name: 'mainItemFlag' },
      { name: 'specifications' },
      { name: 'categoryName' },
      { name: 'uomName' },
    ];
  }, []);

  return customizeTable(
    {
      code: DetailCustomizeCode.LineTableCode,
    },
    <Table dataSet={lineDS} columns={columns} />
  );
};

export default LineTable;