import React, { memo, useMemo, useContext } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { stringify } from 'querystring';

import { ExcuteResultDS } from '../stores/indexDS';
import type { StoreValueType } from '../stores/index';
import { Store } from '../stores/index';

interface ExcuteResultModalType {
  rebatesSerialNum: string,
}


export default memo((props: ExcuteResultModalType) => {
  const { rebatesSerialNum } = props;
  const { history } = useContext<StoreValueType>(Store);
  const ExcuteResultDs = useDataSet(() => ExcuteResultDS(rebatesSerialNum), [rebatesSerialNum]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'chargeNum',
        renderer: ({ record, value }) => value ? (
          <a onClick={() => history.push({
            pathname: `/ssta/new-cost-sheet/detail`,
            search: stringify({
              chargeHeaderId: record?.get('chargeHeaderId'),
              updateFlag: 0,
            }),
          })}>{value}</a>
        ) : null,

      },
    ];
  }, [history]);

  return (
    <div style={{ height: 'calc(100vh - 300px)' }}>
      <Table dataSet={ExcuteResultDs} columns={columns} style={{ maxHeight: 'calc(100% - 35px)' }} />
    </div>
  );
});