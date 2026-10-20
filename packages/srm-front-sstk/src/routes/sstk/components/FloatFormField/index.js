import React from 'react';
import { observer } from 'mobx-react-lite';
import { CheckBox } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import styles from './index.less';

export default observer(function FloatFormField({
  dataSet,
  name,
  title = '',
  readOnly = false,
  yesText = intl.get('sstk.common.view.enable').d('开启'),
  noText = intl.get('sstk.common.view.unEnable').d('关闭'),
}) {
  return (
    <div className={styles['float-form-field-wrap']}>
      <p className={styles['field-title']}>{title}</p>
      {
        readOnly ? dataSet.current.get(name) ? yesText : noText : (
          <CheckBox name={name} dataSet={dataSet}>
            {yesText}
          </CheckBox>
        )
      }
    </div>
  );
});