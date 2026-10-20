/*
 * @Description:
 * @Date: 2024-04-19 14:10:12
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React from 'react';
import { Timeline } from 'choerodon-ui';
import { map, noop } from 'lodash';
import classnames from 'classnames';

import FilterBar from '_components/FilterBarTable/FilterBar';

import NoData from '@/routes/spc/components/OperationRecord/NoData';
import { getComputedColor } from './utils';
import OperationRecordItem from './OperationRecordItem';
import styles from './index.less';

const OperationList = (props) => {
  const {
    onRef,
    onQuery,
    hasData,
    searchDs,
    dataSource = [],
    onViewDetail = noop,
    initTitle,
    remote,
  } = props;
  return hasData ? (
    <>
      {searchDs && (
        <FilterBar
          onRef={onRef}
          dataSet={[searchDs]}
          onQuery={onQuery}
          autoQuery={false}
          expandable={false}
          defaultExpand={false}
        />
      )}
      <div className={classnames(styles['operation-list-wrap'])}>
        <Timeline>
          {map(dataSource, (item) => {
            return (
              <Timeline.Item color={getComputedColor(item.actionCode)} key={item.actionId}>
                <OperationRecordItem
                  remote={remote}
                  initTitle={initTitle}
                  item={item}
                  onViewDetail={onViewDetail}
                />
              </Timeline.Item>
            );
          })}
        </Timeline>
      </div>
    </>
  ) : (
    <NoData />
  );
};

export default OperationList;
