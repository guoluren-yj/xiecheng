import React, { Fragment, useMemo } from 'react';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { observer } from 'mobx-react';
import SearchBarTable from '_components/SearchBarTable';

import { CreateListCustomizeCode } from '../../utils/type';

const List = (props) => {
  const { listDs } = props;

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'templateNum',
      },
      {
        name: 'templateName',
      },
      {
        name: 'versionNumber',
      },
    ];
  }, []);

  return (
    <Fragment>
      <div
        style={{ height: 'calc(100vh - 230px)' }}
      >
        <SearchBarTable
          customizable
          dataSet={listDs}
          columns={columns}
          style={{ maxHeight: 'calc(100% - 22px)' }}
          pagination={{ pageSizeOptions: ['10', '20', '50', '100'] }}
          searchCode={CreateListCustomizeCode.SearchBarCode}
          searchBarConfig={{ expandable: false, closeFilterSelector: true }}
        />
      </div>
    </Fragment>

  );
};

export default observer(List);
