import React from 'react';
import { Icon } from 'choerodon-ui/pro';
import styles from './index.less';

function ViewFilter(props) {
  const { aggregation, onAggregationChange = (e) => e } = props;
  return (
    <div className={styles['workbench-view-filter']}>
      <span
        className={`${!aggregation ? styles['view-active'] : ''}`}
        onClick={() => onAggregationChange(false)}
      >
        <Icon type="view_headline" />
      </span>
      <span
        className={`${aggregation ? styles['view-active'] : ''}`}
        onClick={() => onAggregationChange(true)}
      >
        <Icon type="view_day" />
      </span>
    </div>
  );
}

export default ViewFilter;
