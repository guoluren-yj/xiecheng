import React from 'react';
import { Icon, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import styles from './index.less';

function ViewFilter(props) {
  const { aggregation, onAggregationChange = e => e } = props;
  return (
    <div className={styles['workbench-view-filter']}>
      <Tooltip title={intl.get('sagm.common.view.flatTableView').d('平铺表视图')}>
        <span
          className={`${!aggregation ? styles['view-active'] : ''}`}
          onClick={() => onAggregationChange(false)}
        >
          <Icon type="view_headline" />
        </span>
      </Tooltip>
      <Tooltip title={intl.get('sagm.common.view.aggregateTableView').d('聚合表视图')}>
        <span
          className={`${aggregation ? styles['view-active'] : ''}`}
          onClick={() => onAggregationChange(true)}
        >
          <Icon type="view_day" />
        </span>
      </Tooltip>
    </div>
  );
}

export default ViewFilter;
