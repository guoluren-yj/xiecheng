import React from 'react';
import { Form, TextField } from 'choerodon-ui/pro';

import styles from './index.less';

export default function EditModal({ detailDS, localRecord }) {
  return (
    <div className={styles['domain-edit-form-panel']}>
      <Form dataSet={detailDS} columns={1} labelLayout="float">
        <TextField name="host" disabled={!!localRecord} />
      </Form>
    </div>
  );
}
