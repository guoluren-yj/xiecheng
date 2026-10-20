/* eslint-disable array-callback-return */

import React, { useMemo, forwardRef, useImperativeHandle } from 'react';
import {
  DataSet,
  Form,
  Select,
  Lov,
  TextField,
  IntlField,
  NumberField,
  Output,
} from 'choerodon-ui/pro';

import { createDS } from './createDS';

const compTypeS = {
  Lov,
  Select,
  Output,
  IntlField,
  TextField,
  NumberField,
};

const FormModal = forwardRef((props, ref) => {
  const { componentData, column, readOnly = false } = props;

  const ds = useMemo(() => new DataSet(createDS({ componentData })), []);

  useImperativeHandle(ref, () => ({
    ds,
    ref: ref.current,
  }));

  return (
    <Form
      style={{ width: column > 2 && '75%' }}
      labelLayout={readOnly ? 'vertical' : 'float'}
      dataSet={ds}
      columns={column}
    >
      {componentData.map((item) => {
        if (!item.customParam) {
          const Child = compTypeS[item.compType] || TextField;
          return <Child name={item.name} />;
        }
      })}
    </Form>
  );
});
export default FormModal;
