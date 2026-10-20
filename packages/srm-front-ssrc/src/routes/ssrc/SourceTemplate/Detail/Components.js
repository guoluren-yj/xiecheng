import React from 'react';
import { InputNumber, Form } from 'hzero-ui';

import intl from 'utils/intl';
import styles from './index.less';

const promptCode = 'ssrc.sourceTemplate';

export function AutoDeferPeriod(props = {}) {
  const {
    dataSource,
    form: { getFieldDecorator = () => {} },
    disabled = false,
    required = false,
  } = props;

  return (
    <span className={styles['form-content']}>
      {intl.get(`${promptCode}.model.template.last`).d('最后')}
      <Form.Item>
        {getFieldDecorator('autoDeferPeriod', {
          initialValue: dataSource.autoDeferPeriod,
          rules: [
            {
              required: required,
              message: intl.get('hzero.common.validation.notNull', {
                name: intl.get(`${promptCode}.model.template.autoDeferPeriod`).d('延时触发时间段'),
              }),
            },
          ],
        })(<InputNumber min={1} max={999999999999999} precision={1} disabled={disabled} />)}
      </Form.Item>
      {intl.get('hzero.common.date.unit.minutes').d('分钟')}
    </span>
  );
}
