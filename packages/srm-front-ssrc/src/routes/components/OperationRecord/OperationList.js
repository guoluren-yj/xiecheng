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
  const {
    dataSource = [],
    onViewDetail = noop,
    dataType = '',
    rfTitle = '',
    rfx = {},
    newFlag = true,
    remote,
  } = props;
  return (
    <div className={classnames(styles['common-list-wrap'], styles['operation-list-wrap'])}>
      <Timeline>
        {map(dataSource, (item) => {
          return (
            <Timeline.Item color={getComputedColor(item.processOperation)} key={item.rfxActionId}>
              <OperationRecordItem
                item={item}
                onViewDetail={onViewDetail}
                dataType={dataType}
                rfTitle={rfTitle}
                rfx={rfx}
                newFlag={newFlag}
                remote={remote}
              />
            </Timeline.Item>
          );
        })}
      </Timeline>
    </div>
  );
}
