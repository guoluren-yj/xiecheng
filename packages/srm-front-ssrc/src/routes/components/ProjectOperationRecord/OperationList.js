/**
 * 操作记录列表
 */
import React from 'react';
import { Timeline } from 'choerodon-ui';
import { map, noop } from 'lodash';
import classnames from 'classnames';

import { getComputedColor } from './utils';

import OperationRecordItem from './OperationRecordItem';

import styles from './index.less';

export default function OperationList(props) {
  const { dataSource = [], onViewDetail = noop } = props;
  return (
    <div className={classnames(styles['common-list-wrap'], styles['operation-list-wrap'])}>
      <Timeline>
        {map(dataSource, (item) => {
          return (
            <Timeline.Item
              color={getComputedColor(item.processOperation)}
              key={item.projectActionId}
            >
              <OperationRecordItem item={item} onViewDetail={onViewDetail} />
            </Timeline.Item>
          );
        })}
      </Timeline>
    </div>
  );
}
