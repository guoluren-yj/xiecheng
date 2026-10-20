/*
 * @Description:
 * @Date: 2022-04-14 16:30:17
 * @Author: yitian.mao@going-link.com
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React from 'react';
import { Timeline } from 'choerodon-ui';
import { map, noop, isEmpty } from 'lodash';

import intl from 'utils/intl';
import FilterBar from '_components/FilterBarTable/FilterBar';

import { ReactComponent as NoData } from '@/assets/no-data.svg';
import { getComputedColor } from './utils';
import OperationRecordItem from './OperationRecordItem';
import styles from './index.less';

export default function OperationList(props) {
  const {
    dataSource = [],
    onViewDetail = noop,
    remote,
    showFlag,
    hasTab,
    onRef,
    hasData,
    searchDs,
    onQuery,
  } = props;
  return hasData ? (
    <>
      {showFlag && (
        <FilterBar
          onRef={onRef}
          dataSet={[searchDs]}
          onQuery={onQuery}
          autoQuery={false}
          expandable={false}
          defaultExpand={false}
        />
      )}
      {!isEmpty(dataSource) ? (
        <div className={styles['operation-list-wrap']}>
          <Timeline>
            {map(dataSource, (item) => {
              return (
                <Timeline.Item color={getComputedColor(item.processTypeCode)} key={item.pcActionId}>
                  <OperationRecordItem remote={remote} item={item} onViewDetail={onViewDetail} />
                </Timeline.Item>
              );
            })}
          </Timeline>
        </div>
      ) : (
        <div
          className={styles['no-data']}
          style={{ height: hasTab ? 'calc(100vh - 265px)' : 'calc(100vh - 214px)' }}
        >
          <NoData />
          <span>{intl.get('hzero.common.message.data.none').d('暂无数据')}</span>
        </div>
      )}
    </>
  ) : (
    <div className={styles['no-data']} style={{ height: 'calc(100vh - 214px)' }}>
      <NoData />
      <span>{intl.get('hzero.common.message.data.none').d('暂无数据')}</span>
    </div>
  );
}
