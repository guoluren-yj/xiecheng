import React from 'react';
import { Tooltip } from 'choerodon-ui';
import { Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import styles from './styles.less';

const ViewFilter = (props) => {
  const { aggregation, onAggregationChange = (e) => e } = props;
  return (
    <div className={styles['workbench-view-filter']}>
      <Tooltip title={intl.get('smodr.common.view.flatTableView').d('平铺表视图')}>
        <span
          className={`${!aggregation ? 'view-active' : ''}`}
          onClick={() => onAggregationChange(false)}
        >
          <Icon type="view_headline" />
        </span>
      </Tooltip>
      <Tooltip title={intl.get('smodr.common.view.aggregateTableView').d('聚合表视图')}>
        <span
          className={`${aggregation ? 'view-active' : ''}`}
          onClick={() => onAggregationChange(true)}
        >
          <Icon type="view_day" />
        </span>
      </Tooltip>
    </div>
  );
};

export default ViewFilter;