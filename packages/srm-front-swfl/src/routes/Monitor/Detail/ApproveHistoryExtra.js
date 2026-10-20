import React, { useState, useRef } from 'react';
import { Collapse } from 'choerodon-ui';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { fetchDetail } from '@/services/monitorService';
import { processStatusRender } from '@/utils/util';

import ApproveHistory from './ApproveHistory';
import styles from './index.less';

const { Panel } = Collapse;

export default function ApproveHistoryExtra({ records, processStatusMap }) {
  const [listData, setListData] = useState({});
  const [loading, setLoading] = useState({});
  const fetchFlag = useRef({});

  const handleFetchList = (id) => {
    if (!fetchFlag.current[id]) {
      fetchFlag.current[id] = true;
      setLoading({ ...loading, [id]: true });
      fetchDetail({
        id,
      })
        .then((res) => {
          if (getResponse(res) && res) {
            setListData({ ...listData, [id]: res });
          }
        })
        .finally(() => {
          setLoading({ ...loading, [id]: false });
        });
    }
  };

  const handleChange = (keys) => {
    if (!keys || !keys.length) {
      return;
    }
    keys.forEach((i) => {
      handleFetchList(i);
    });
  };

  return (
    <Collapse
      bordered={false}
      className={styles['approve-history-collapse']}
      onChange={handleChange}
    >
      {records.map((record) => (
        <Panel
          key={record.id}
          showArrow
          header={
            <span className={styles['collapse-item-header']}>
              <span className={styles['collapse-item-title']}>
                <span style={{ marginRight: 20 }}>
                  {intl.get('hwfp.common.model.process.ID').d('流程标识')}:
                  <span style={{ marginLeft: 8 }}>{record.id}</span>
                </span>
                {processStatusRender(processStatusMap, record.deleteReason)}
              </span>
              <span className={styles['collapse-item-header-extra']}>
                {record.startTime}
                <span>~</span>
                {record.endTime}
              </span>
            </span>
          }
        >
          <ApproveHistory detail={listData[record.id] || {}} loading={loading[record.id]} />
        </Panel>
      ))}
    </Collapse>
  );
}
