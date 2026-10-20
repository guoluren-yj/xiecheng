import { Icon } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import React from 'react'; // useEffect
import intl from 'utils/intl';
import styles from './index.less';

const Index = ({ tableDisplay, setDisplayStatus }) => {
  return (
    <div className={styles['view-search']}>
      <Popover content={intl.get('sprm.common.model.flatTableView').d('平铺表视图')}>
        <span
          className={tableDisplay === 'flat' ? 'active' : 'change-table'}
          onClick={() => {
            setDisplayStatus('flat');
          }}
        >
          <Icon type="view_headline" style={{ fontSize: 16 }} />
        </span>
      </Popover>
      <Popover content={intl.get('sprm.common.model.aggregateTableView').d('聚合表视图')}>
        <span
          className={tableDisplay !== 'flat' ? 'active' : 'change-table'}
          onClick={() => {
            setDisplayStatus('wide');
          }}
        >
          <Icon type="view_day" style={{ fontSize: 16 }} />
        </span>
      </Popover>
    </div>
  );
};

export default Index;
