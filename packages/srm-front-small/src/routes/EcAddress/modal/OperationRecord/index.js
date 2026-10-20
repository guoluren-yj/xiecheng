import React from 'react';
import { Spin, DataSet } from 'choerodon-ui/pro';
import { Timeline, Tooltip, Icon } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { SRM_MALL } from '_utils/config';

import intl from 'utils/intl';
import styles from './index.less';
import { StyleMap } from './map';

export default function OperationRecord({ params }) {
  const ds = new DataSet({
    autoQuery: true,
    // paging: false,
    transport: {
      read: {
        url: `${SRM_MALL}/v1/region-records`,
        method: 'GET',
        params,
        data: params,
      },
    },
  });

  const OperationTimeLine = observer(({ dataSet }) => {
    return (
      <Timeline>
        {dataSet.map(record => {
          const { creationDate, messageCode, description = '' } = record.get([
            'creationDate',
            'messageCode',
            'description',
          ]);

          return (
            <Timeline.Item
              color={StyleMap[messageCode]?.dotColor || '#E5E5E5'}
              className={styles['operation-timeline']}
            >
              <div className="timeline-container">
                <div className="timeline-icon">
                  <Icon type={StyleMap[messageCode]?.icon} />
                </div>
                <div className="timeline-desc" dangerouslySetInnerHTML={{ __html: description }} />
              </div>
              <div className="timeline-footer">{creationDate}</div>
            </Timeline.Item>
          );
        })}
        {ds.records.length < 1 && ds.status === 'ready' && (
          <div className={styles['timeline-no-data']}>
            {intl.get(`small.common.view.noData`).d('暂无数据')}
          </div>
        )}
      </Timeline>
    );
  });
  return (
    <Spin dataSet={ds}>
      <OperationTimeLine dataSet={ds} />
    </Spin>
  );
}
