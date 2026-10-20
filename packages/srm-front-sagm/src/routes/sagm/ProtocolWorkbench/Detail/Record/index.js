import React from 'react';
import { Timeline } from 'choerodon-ui';
import { Spin, Icon } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import styles from './index.less';

const RecordTimeline = (props) => {
  const { dataSet, renderer = (e) => e, modal } = props;

  const TimelineO = observer(({ dataSet: ds }) => {
    return (
      <Timeline className={styles['sku-record-timeline']}>
        {ds.map((m, index) => {
          const { icon, color, time, header, content } =
            renderer({ dataSet, record: m, index }, modal) || {};
          return (
            <Timeline.Item color={color || '#e5e5e5'}>
              <div className={styles['timeline-container']}>
                <div className="timeline-icon">
                  <Icon type={icon || 'add'} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">{header}</div>
                  <div className="timeline-body">{content}</div>
                  <div className="timeline-footer">{time}</div>
                </div>
              </div>
            </Timeline.Item>
          );
        })}
      </Timeline>
    );
  });

  return (
    <Spin dataSet={dataSet}>
      <TimelineO dataSet={dataSet} />
    </Spin>
  );
};

export default RecordTimeline;
