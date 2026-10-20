/**
 * 操作记录列表
 */
import React from 'react';
import { Timeline } from 'choerodon-ui';
import { map } from 'lodash';
import classnames from 'classnames';

import OperationRecordItem from './OperationRecordItem';

import styles from './index.less';

export default function OperationList(props) {
  const { dataSource = [] } = props;
  return (
    <div className={classnames(styles['common-list-wrap'], styles['operation-list-wrap'])}>
      <Timeline>
        {map(dataSource, (item) => {
          return (
            <Timeline.Item color="#E5E5E5">
              <OperationRecordItem item={item} />
            </Timeline.Item>
          );
        })}
      </Timeline>
    </div>
  );
}
