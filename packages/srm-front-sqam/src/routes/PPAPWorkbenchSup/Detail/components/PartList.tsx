// 零件列表
import React, { Fragment, useMemo, useContext } from 'react';
import { Table } from 'choerodon-ui/pro';
import { SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { observer } from 'mobx-react';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { DetailProjectPartListCode } from '../../utils/type';


const PartList = () => {
  const { partLineDs, customizeTable } = useContext<StoreValueType>(Store);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'partLov',
      },
      {
        name: 'itemName',
      },
      {
        name: 'categoryLov',
      },
      {
        name: 'manufacturer',
      },
      {
        name: 'specification',
      },
      {
        name: 'model',
      },
    ];
  }, []);

  return (
    <Fragment>
      {customizeTable(
        { code: DetailProjectPartListCode },
        <Table
          columns={columns}
          dataSet={partLineDs}
          selectionMode={SelectionMode.none}
          style={{ maxHeight: 430 }}
        />
      )}
    </Fragment>

  );
};

export default observer(PartList);
