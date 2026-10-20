import React from 'react';
import { Form, TextField, IntlField } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react';

import intl from 'utils/intl';

import styles from './TodoRemind.less';

const COLORS = ['red', 'orange', 'green', 'geekblue'];

function TaskTag({ record }) {
  return (
    <div>
      <div className={styles['label-title']}>
        {intl.get('hwfp.processDefine.view.title.baseInfo').d('基础信息')}
      </div>
      <Form record={record} columns={1} labelLayout="float">
        <TextField name="labelCode" />
        <IntlField name="description" />
      </Form>
      <div className={styles['label-title']} style={{ marginTop: '32px' }}>
        {intl.get('hwfp.processDefine.model.tag.color').d('标签颜色')}
      </div>
      <div>
        {COLORS.map((color) => (
          <div
            style={{ backgroundColor: color === 'geekblue' ? '#2f54eb' : color }}
            className={styles['label-color-item']}
            onClick={() => {
              record.set('labelColor', color);
            }}
          >
            {record.get('labelColor') === color && <Icon type="check" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default observer(TaskTag);
