import React from 'react';
import { Form } from 'choerodon-ui/pro';

const ReplenishInfo = function ReplenishInfo(props) {
  const { code, ds, customizeForm } = props;

  const form = customizeForm(
    {
      code,
      __force_record_to_update__: true,
      dataSet: ds,
    },
    <Form dataSet={ds} showLines={6} columns={1} labelLayout="float" useColon={false} />
  );

  return form;
};

export default ReplenishInfo;
