import React from 'react';

import { observer } from 'mobx-react-lite';
import styles from './index.less';
import FrontPage from './FrontPage';

export default observer(function (props) {
  return (
    <div className={styles['script-event']}>
      <FrontPage {...props} />
    </div>
  );
});
