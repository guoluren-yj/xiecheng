import React, { useState } from 'react';
import { DataSet, Form, TextArea } from 'choerodon-ui/pro';

import c7nModal from '@/utils/c7nModal';

// import styles from './style.less';

const TextAreaForm = (props) => {
  const { name, value, dataSet, maxLength } = props;
  const [valueLength, setLength] = useState(value.length);
  return (
    <div>
      <Form dataSet={dataSet} labelLayout="float">
        <TextArea
          name={name}
          rowSpan={4}
          resize="vertical"
          onInput={(e) => setLength(e.target.value.length || 0)}
        />
      </Form>
      <span hidden={!maxLength} style={{ float: 'right' }}>
        {valueLength}/{maxLength}
      </span>
    </div>
  );
};

export default function openTextArea({
  title,
  width = 380,
  name,
  label,
  value,
  required = true,
  maxLength,
  onOk = (e) => e,
}) {
  const ds = new DataSet({
    fields: [{ name, label, required, maxLength }],
  });
  ds.create({ [name]: value });
  return c7nModal({
    title,
    style: { width },
    children: <TextAreaForm name={name} value={value || ''} dataSet={ds} maxLength={maxLength} />,
    onOk: async () => {
      const flag = await ds.validate();
      if (flag) {
        const param = ds.current.toData();
        return onOk(param);
      } else {
        return false;
      }
    },
  });
}
