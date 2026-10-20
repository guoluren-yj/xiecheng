import React, { useContext } from 'react';
import moment from 'moment';
import { observer } from 'mobx-react-lite';
import { TextField, DatePicker, Lov, Form, Row } from 'choerodon-ui/pro';
// import { colorRender } from '../hook';

import { Store } from '../stores/storeProvider';

const BaseInfo = function BaseInfo() {
  const { headerDs, budgetHeaderStatus, setFormFieldsHiddenObj } = useContext(Store);

  const form = (
    <Form
      useWidthPercent
      dataSet={headerDs}
      showLines={6}
      columns={3}
      labelLayout="float"
      useColon={false}
    >
      <TextField name="budgetNum" />
      <TextField name="budgetHeaderDesc" />
      <Lov name="budgetTemplateCode" />

      <Lov name="periodNum" />
      <DatePicker
        name="validityDate"
        mode="dateTime"
        defaultTime={[moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]}
      />

      {!['NEW', 'REJECT', 'APPROVING'].includes(budgetHeaderStatus) && (
        <>
          <Lov name="adjustPeriodNum" />
          <DatePicker
            name="adjustValidityDate"
            mode="dateTime"
            defaultTime={[moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]}
          />
        </>
      )}

      <TextField
        name="budgetHeaderStatusMeaning"
        // renderer={({ value, record }) => colorRender(record?.get('budgetHeaderStatus'), value)}
      />
      <Lov name="responsibleId" />
      {!setFormFieldsHiddenObj?.hiddenCreatedBy && <TextField name="createdByName" />}
      <DatePicker name="creationDate" />
      <TextField name="version" />
    </Form>
  );

  return <Row>{form}</Row>;
};

export default observer(BaseInfo);
