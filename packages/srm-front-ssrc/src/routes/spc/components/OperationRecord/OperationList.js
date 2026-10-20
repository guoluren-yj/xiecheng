import React from 'react';
import { Timeline } from 'choerodon-ui';
import { map, noop, isEmpty } from 'lodash';
import classnames from 'classnames';

import FilterBar from '_components/FilterBarTable/FilterBar';

import { getComputedColor } from './utils';
import OperationRecordItem from './OperationRecordItem';
import styles from './index.less';
import NoData from './NoData';

const OperationList = (props) => {
  const {
    onRef,
    showFlag,
    searchDs,
    onQuery,
    dataSource = [],
    onViewDetail = noop,
    initTitle,
    fieldParam,
  } = props;
  const { actionCode = 'actionCode', actionId = 'actionId' } = fieldParam;
  return (
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
      <div className={classnames(styles['operation-list-wrap'])}>
        {!isEmpty(dataSource) ? (
          <Timeline>
            {map(dataSource, (item) => {
              return (
                <Timeline.Item color={getComputedColor(item[actionCode])} key={item[actionId]}>
                  <OperationRecordItem
                    initTitle={initTitle}
                    item={item}
                    fieldParam={fieldParam}
                    onViewDetail={onViewDetail}
                  />
                </Timeline.Item>
              );
            })}
          </Timeline>
        ) : (
          <NoData />
        )}
      </div>
    </>
  );
};

export default OperationList;
