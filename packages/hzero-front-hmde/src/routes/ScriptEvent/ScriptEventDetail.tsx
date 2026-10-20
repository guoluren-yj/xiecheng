import React from 'react';

import { StoreProvider } from './store';

import EditPage from './EditPage';
import styles from './index.less';

export default function (props) {
  return (
    <StoreProvider {...props}>
      <div className={styles['script-event']}>
        <EditPage {...props} />
      </div>
    </StoreProvider>
  );
}
