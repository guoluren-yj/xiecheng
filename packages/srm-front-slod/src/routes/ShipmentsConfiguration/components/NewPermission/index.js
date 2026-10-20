import React, { Fragment, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import { DataSet, Table, Spin } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { savePermission } from '@/services/ShipmentsConfigurationService';
import { indexDS } from './indexDS';

const ModalIndex = forwardRef((props, ref) => {
  const { urlFlag, classify, strategyLineId } = props;
  const indexDs = useMemo(() => new DataSet(indexDS()), [strategyLineId]);
  useEffect(() => {
    indexDs.setQueryParameter('params', {
      strategyLineId,
    });
    indexDs.query();
  }, []);
  useImperativeHandle(ref, () => ({
    ref: ref.current,
    saveOnChange,
  }));

  const saveOnChange = async () => {
    const data = indexDs.toData();
    const params = { strategyLineId, data };
    const flag = await indexDs.validate();
    if (flag) {
      const res = await savePermission(params);
      if (getResponse(res)) {
        notification.success();
        indexDs.query();
      }
      return false;
    } else {
      return false;
    }
  };

  const columns = [
    {
      name: 'closeMethod',
      width: 120,
      editor: false,
    },
    {
      name: 'canCloseStatus',
      width: 150,
      editor: !classify,
    },
    {
      name: 'forcedCloseType',
      width: 200,
      editor: !classify,
    },
    {
      name: 'downstreamStatus',
      width: 190,
      editor: !urlFlag && !classify,
    },
    {
      name: 'quantityOccupiedType',
      width: 220,
      editor: (record) => !classify && record.get('quantityOccupiedTypeEditFlag') === 1,
    },
  ];

  return (
    <Fragment>
      <Spin spinning={false}>
        <div style={{ height: 'calc(100vh - 190px)' }}>
          <Table
            dataSet={indexDs}
            columns={columns}
            boxSizing="wrapper"
            customizedCode="node-codes"
            style={{ maxHeight: `calc(100% - 22px)` }}
          />
        </div>
      </Spin>
    </Fragment>
  );
});

export default ModalIndex;
