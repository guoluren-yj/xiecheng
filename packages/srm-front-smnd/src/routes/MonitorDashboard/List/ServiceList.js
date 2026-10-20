import React, { useState, memo } from 'react';
// import { Col, Row } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import BusinessList from './BusinessList';

import TreeMenu from './components/TreeMenu';

import styles from '../index.less';

function ServiceList(props) {
  const { customizeTable, BusinessDs, history, activeKey } = props;
  const [loading, setLoading] = useState(false);
  return (
    <Spin spinning={loading || false}>
      <div className={styles['rule-search-tree']}>
        <TreeMenu
          handleLoading={(value) => setLoading(value)}
          BusinessDs={BusinessDs}
          activeKey={activeKey}
        />
      </div>
      <div className={styles['rule-search-table']}>
        <BusinessList customizeTable={customizeTable} BusinessDs={BusinessDs} history={history} />
      </div>
    </Spin>
  );
}

export default memo(ServiceList);
