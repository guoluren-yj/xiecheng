import React, { useContext } from 'react';
import { TextField, Form, IntlField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import Store from '../store/index';

const BaseInfo = (props) => {
  const {
    remote,
    customizeForm,
    commonDs: { baseInfoDs },
  } = useContext(Store);
  const { handleSourceCategoryChange } = props;

  const getFields = () => {
    const list = [
      <TextField name="templateNum" />,
      <IntlField name="templateName" />,
      <TextField name="versionNumber" />,
      <TextField name="templateStatusMeaning" hidden />,
    ];
    return remote?.process('SSRC.SOURCE_TEMPLATE_WORKBENCH_UPDATE.PROCESS_BASE_INFO_FORM', list, {
      baseInfoDs,
      handleSourceCategoryChange,
    });
  };
  return customizeForm(
    {
      code: 'SSRC.SOURCE_TEMPLATE_WORKBENCH_UPDATE.BASE_INFO',
      dataSet: baseInfoDs,
    },
    <Form dataSet={baseInfoDs} columns={3} labelLayout="float" useWidthPercent>
      {getFields()}
    </Form>
  );
};

export default observer(BaseInfo);
