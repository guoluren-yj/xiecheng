import React, { useEffect } from 'react';
import { Form, Output } from 'choerodon-ui/pro';

import styles from './index.less';

function DomainConfig({ detailDS }) {
  useEffect(() => {
    detailDS.query();
  }, []);

  // const editFlag = detailDS.getState('editFlag');

  return (
    <>
      <div style={{ margin: '8px' }} className={styles['domain-config-table-box']}>
        <Form columns={2} dataSet={detailDS} labelLayout="float">
          {/* {editFlag ? <TextField name="host" /> : <Output name="host" />} */}
          <Output name="userName" />
          <Output name="operateTime" />
        </Form>
      </div>
    </>
  );
}

export default DomainConfig;
