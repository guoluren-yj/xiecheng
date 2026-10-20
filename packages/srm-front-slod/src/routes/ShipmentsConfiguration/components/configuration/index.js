import React, { Fragment, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import { DataSet, Table, Spin } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { saveModal } from '@/services/ShipmentsConfigurationService';
import { indexDS } from './indexDS';

const ModalIndex = forwardRef((props, ref) => {
  const { classify, strategyLineId = null } = props;
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
      const res = await saveModal(params);
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
      name: 'tabCodeMeaning',
      width: 200,
    },
    {
      name: 'operateRoleIdListAll',
      width: 200,
      editor: !classify,
    },
    {
      name: 'queryRoleIdListAll',
      width: 200,
      editor: !classify,
    },
  ];

  return (
    <Fragment>
      <Spin spinning={false}>
        <div style={{ height: 'calc(100vh - 245px)' }}>
          <Table
            boxSizing="wrapper"
            style={{ maxHeight: `calc(100% - 22px)` }}
            dataSet={indexDs}
            columns={columns}
            customizedCode="node-codes-modal"
          />
        </div>
      </Spin>
    </Fragment>
  );
});

export default ModalIndex;
