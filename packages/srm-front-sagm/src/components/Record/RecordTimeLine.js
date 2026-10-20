import React from 'react';
import { Timeline } from 'choerodon-ui';
import { Spin, Icon } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';

import styles from './styles.less';

const RecordTimeline = (props) => {
  const { dataSet, renderer = (e) => e } = props;

  const TimelineO = observer(({ dataSet: ds }) => {
    return (
      <Timeline className={styles['sku-record-timeline']}>
        {ds.map((m, idx) => {
          const { icon, color, time, header, content } = renderer({ dataSet, record: m }) || {};
          return (
            // eslint-disable-next-line react/no-array-index-key
            <Timeline.Item color={color || '#e5e5e5'} key={idx}>
              <div className={styles['timeline-container']}>
                <div className="timeline-icon">
                  <Icon type={icon || 'add'} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">{header}</div>
                  <div className="timeline-body">{content}</div>
                  <div className="timeline-footer">{dateTimeRender(time)}</div>
                </div>
              </div>
            </Timeline.Item>
          );
        })}
        {ds.records.length < 1 && ds.status === 'ready' && (
          <div className="timeline-no-data">
            {intl.get(`sagm.common.model.noData`).d('暂无数据')}
          </div>
        )}
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
