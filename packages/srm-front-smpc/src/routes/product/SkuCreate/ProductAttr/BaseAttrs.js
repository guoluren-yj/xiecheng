import React from 'react';
import { observer } from 'mobx-react-lite';
import { Form } from 'choerodon-ui/pro';

import EditAttrForm from './EditAttrForm';

const BaseAttrsForm = observer(({ dataSet, style = {} }) => {
  return (
    <div style={style}>
      {dataSet.map((record, ind) => (
        <Form record={record} labelAlign="left" labelLayout="float">
          <EditAttrForm record={record} id={`base_attr_${ind}`} />
        </Form>
      ))}
    </div>
  );
});

export default BaseAttrsForm;
