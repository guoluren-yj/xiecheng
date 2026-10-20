import React, { useState } from 'react';
import { CheckBox, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import styles from './index.less';

export default function Preference({ initStatus, handleCancel, onChange }) {
  const [status, changeStatus] = useState(initStatus);

  const handleChange = (newStatus) => {
    changeStatus(newStatus);
  };

  return (
    <div className={styles.preference}>
      <div className={styles['preference-content']}>
        <CheckBox className={styles.switch} defaultChecked={status} onChange={handleChange} />
        {intl.get('hwfp.common.atuo.handle').d('审批后自动打开下一代办')}
      </div>
      <div className={styles['preference-footer']}>
        <Button color="primary" onClick={() => onChange(status)}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
        <Button onClick={handleCancel}>
          {intl.get('hwfp.common.model.apply.cancel').d('取消')}
        </Button>
      </div>
    </div>
  );
}
