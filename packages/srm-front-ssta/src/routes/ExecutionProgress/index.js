import React, { useMemo, useCallback } from 'react';
import intl from 'utils/intl';
import querystring from 'querystring';
// import { List } from 'choerodon-ui'
import { compose } from 'lodash';
import { DataSet, Progress, Button, Modal } from 'choerodon-ui/pro';
import FilterBarTable from '_components/FilterBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentUserId } from 'utils/utils';

import { ds } from './store.js';
import Detail from './detail';

import styles from './index.less';

const Index = (props) => {
  const { href, taskDocType: taskDocTypeProps } = props;
  const params =
    querystring.parse((href || '').replace('/ssta/execution-progress', '').substr(1)) || {};
  const { taskDocType: taskDocTypeParams } = params;
  const taskDocType = taskDocTypeProps || taskDocTypeParams;
  const createdBy = getCurrentUserId();
  const tableDs = useMemo(() => new DataSet(ds({ taskDocType, createdBy })), [
    taskDocType,
    createdBy,
  ]);

  const handleToDetail = useCallback((record) => {
    const taskDocNum = record.get('taskDocNum');
    Modal.open({
      title: intl.get(`ssta.common.view.title.taskProgressDetail`).d('任务进度明细'),
      size: 'large',
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      style: {
        width: '742px',
      },
      closable: true,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: <Detail taskDocNum={taskDocNum} />,
    });
  }, []);

  const columns = useMemo(() => {
    return [
      {
        name: 'taskDocNum',
        width: 220,
        renderer: ({ record, value }) => {
          return (
            <Button
              wait={1000}
              funcType="link"
              color="primary"
              style={{ userSelect: 'text' }}
              onClick={() => handleToDetail(record)}
            >
              {value}
            </Button>
          );
        },
      },
      { name: 'taskDocType' },
      { name: 'status' },
      { name: 'totalBatches' },
      {
        name: 'readyQuantityProcess',
        renderer: ({ record }) => (
          <Progress
            dataSet={tableDs}
            record={record}
            name="readyQuantityProcess"
            type="circle"
            className={styles['process-width-less']}
          />
        ),
      },
      { name: 'readySuccessTime', width: 150 },
      {
        name: 'executeQuantityProcess',
        renderer: ({ record }) => (
          <Progress
            dataSet={tableDs}
            record={record}
            name="executeQuantityProcess"
            type="circle"
            className={styles['process-width-less']}
          />
        ),
      },
      { name: 'executeSuccessTime', width: 150 },
      { name: 'remark' },
    ];
  }, [tableDs, handleToDetail]);

  return (
    <FilterBarTable
      dataSet={tableDs}
      customizable
      columns={columns}
      className={styles['exection-progress-table']}
      onRow={() => ({
        style: { height: '40px !important', lineHeight: '40px !important' },
      })}
      filterBarConfig={{
        checkDataSetStatus: false,
        autoQuery: true,
        collpaseble: false,
        expandable: false,
      }}
      style={{ maxHeight: 'calc(100vh - 160px)' }}
    />
  );
};

export default compose(
  formatterCollections({
    code: ['ssta.exectionProgress'],
  })
)(Index);
