import React from 'react';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { DataSet } from 'choerodon-ui/pro';
import ListTable from './ListTable';
// @ts-ignore
import styles from './index.less';

interface OverviewProps {
  tableDs: DataSet,
  history: any,
}

const Overview: React.FC<OverviewProps> = ({ tableDs, history }) => {
  return (
    <div className={styles.content}>
      <div className={styles['content-rightList']}>
        <ListTable tableDs={tableDs} history={history} />
      </div>
    </div>
  );
};

export default React.memo(formatterCollections({
  code: ['hitf.InterfaceMonitor', 'hitf.interfaceMonitor'],
})(Overview));
