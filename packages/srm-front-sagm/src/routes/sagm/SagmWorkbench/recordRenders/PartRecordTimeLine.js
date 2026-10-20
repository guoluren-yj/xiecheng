import React from 'react';
import { Timeline, Divider } from 'choerodon-ui';
import { Spin, Icon, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';

import styles from './styles.less';

const PartRecordTimeline = (props) => {
  const {
    dataSet,
    partLoad = false, // 分批次请求数据
    loadMore = () => null,
    renderer = (e) => e,
  } = props;
  const TimelineO = observer(({ dataSet: ds }) => {
    return (
      <>
        <Timeline className={styles['sku-record-timeline']}>
          {ds.map((m) => {
            const { icon, color, time, header, content } = renderer({ dataSet, record: m }) || {};
            return (
              <Timeline.Item color={color || '#e5e5e5'}>
                <div className={styles['timeline-container']}>
                  <div className="timeline-icon">
                    <Icon type={icon} />
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
        {partLoad && !ds.getState('noMore') && ds.getState('finishLoading') && (
          <Divider dashed className={styles['timeline-load-more-divider']}>
            <Button
              funcType="link"
              color="primary"
              onClick={() => loadMore(ds)}
              className={styles['timeline-load-more']}
            >
              {intl.get(`hzero.common.basicLayout.viewMore`).d('查看更多')}
              <Icon type="expand_more" />
            </Button>
          </Divider>
        )}
      </>
    );
  });
  return (
    <Spin spinning={!dataSet.getState('finishLoading')}>
      <TimelineO dataSet={dataSet} />
    </Spin>
  );
};

export default observer(PartRecordTimeline);
