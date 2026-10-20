import React, { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, IntlField, TextField, DateTimePicker } from 'choerodon-ui/pro';
import { noop } from 'lodash';

import { StoreContext } from '../store/StoreProvider';

const HeaderInfo = observer(() => {
  const { commonDs: { headerDs } = {}, getCustomizeUnitCode, customizeForm = noop } = useContext(
    StoreContext
  );

  return customizeForm(
    {
      code: getCustomizeUnitCode('updateBaseInfo'),
      dataSet: headerDs,
    },
    <Form dataSet={headerDs} columns={3} labelLayout="float" useWidthPercent>
      <IntlField name="fileManageName" />
      <TextField name="createdByName" />
      <DateTimePicker name="creationDate" />
      <IntlField name="remark" type="multipleLine" resize="vertical" newLine colSpan={3} />
    </Form>
  );
});

export default HeaderInfo;
