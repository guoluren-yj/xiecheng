/* eslint-disable react/jsx-key */
import React, { useMemo, useCallback, useState } from 'react';
import {
  Button,
  Table,
} from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'hzero-front/lib/utils/intl';

import {
  updateDataSetParams,
  fetchDataSet,
} from '@/services/dataSetService';

const MetaData = ({ datasetId, paramsTableDs }) => {
  const [editing, setEditing] = useState(false);
  const paramsTableColumn = useMemo(() => {
    return [
      {
        name: 'paramName',
        editor: editing,
      },
      {
        name: 'paramCode',
      },
      {
        name: 'dataType',
        editor: editing,
      },
    ];
  }, [editing]);

  const refresh = useCallback(
    (callback) => {
      fetchDataSet(datasetId).then(callback);
    },
    [datasetId]
  );

  const handleEdit = useCallback(() => {
    setEditing(true);
  }, []);

  const handleSave = useCallback(
    async () => {
      const flag = await paramsTableDs.validate();
      if (!flag) {
        return;
      }
      const data = paramsTableDs.toData();
      const res = await updateDataSetParams(data);
      if (getResponse(res)) {
        notification.success();
        setEditing(false);
        refresh((data) => {
          if (data && data.datasetParamList && data.datasetParamList.length > 0) {
            paramsTableDs.loadData(data.datasetParamList);
          }
        });
      }
    },
    [paramsTableDs]
  );
  const handleCancle = useCallback(() => {
    setEditing(false);
  }, []);

  const paramsTableButtons = useMemo(() => {
    if (!paramsTableDs.records.length) {
      return;
    }
    if (!editing) {
      return [
        <Button color="primary" funcType="flat" onClick={handleEdit}>
          {intl.get('hzero.common.button.edit').d('编辑')}
        </Button>,
      ];
    } else {
      return [
        <Button color="primary" funcType="flat" onClick={handleSave}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>,
        <Button color="primary" funcType="flat" onClick={handleCancle}>
          {intl.get('hzero.common.button.cancel').d('取消')}
        </Button>,
      ];
    }
  }, [paramsTableDs, editing]);

  return (
    <Table
      autoHeight={{ type: 'maxHeight', diff: 40 }}
      buttons={paramsTableButtons}
      dataSet={paramsTableDs}
      columns={paramsTableColumn}
    />
  );
};

export default MetaData;
