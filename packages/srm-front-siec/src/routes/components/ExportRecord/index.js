/* eslint-disable camelcase */
import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import moment from 'moment';
import notification from 'utils/notification';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { isNil } from 'lodash';
import { getResponse } from 'utils/utils';
import { Spin } from 'choerodon-ui';
import { reExecuteApi } from '../../../services/pcnmanageWorkbenchService';

function ExportRecord(props) {
  const [loading, setLoading] = useState(false);
  const { pcnHeaderId, pcnLineId, tableDs } = props;

  useEffect(() => {
    tableDs.setQueryParameter('params', { pcnHeaderId, pcnLineId });
    tableDs.query();
  }, [pcnHeaderId]);

  const reExecute = useCallback(
    (record) => {
      if (!isNil(pcnHeaderId) && !isNil(pcnLineId)) {
        setLoading(true);
        reExecuteApi({ pcnHeaderId, pcnLineId, record }).then((res) => {
          console.log(res, 'res');
          if (getResponse(res)) {
            setLoading(false);
            const newData = tableDs.data.map((i) => (i.get('recordId') === res.recordId ? res : i));
            tableDs.loadData(newData, tableDs.currentPage);
            notification.success();
          } else {
            setLoading(false);
          }
        });
      }
    },
    [loading]
  );

  const getColumns = () => {
    return [
      {
        name: 'importTypeMeaning',
        width: 100,
      },
      {
        name: 'importStatusMeaning',
        width: 100,
      },
      {
        name: 'externalSystemCode',
        width: 140,
      },
      {
        name: 'importMessage',
        width: 140,
      },
      {
        name: 'lastUpdateDate',
        width: 150,
        renderer: ({ value }) => (value ? moment(value).format(DEFAULT_DATETIME_FORMAT) : null),
      },
      {
        name: 'lastUpdatedName',
        width: 100,
      },
      {
        name: 'button',
        renderer: ({ record }) =>
          !['SUCCESS', 'IMPORTING'].includes(record.get('importStatus')) ||
          ['FAIL'].includes(record.get('importStatus')) ? (
            // eslint-disable-next-line react/jsx-indent
            <Button loading={loading} funcType="link" onClick={() => reExecute(record.toData())}>
              {intl.get(`sinv.common.model.common.alinge`).d('重新执行')}
            </Button>
          ) : (
            intl.get(`sinv.common.model.common.alinge`).d('重新执行')
          ),
      },
    ];
  };
  console.log('加载');
  return (
    <Spin spinning={loading}>
      <Table dataSet={tableDs} columns={getColumns()} />
    </Spin>
  );
}

export default ExportRecord;
