import React from 'react';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { TextField, Form, Select, Switch, Lov, DataSet, IntlField } from 'choerodon-ui/pro';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';

interface CreateProps {
  createDs: DataSet,
}

const Create: React.FC<CreateProps> = ({ createDs }) => {

  return (
    <Form dataSet={createDs} labelLayout={LabelLayout.float} style={{ marginLeft: '-0.09rem' }}>
      <Lov name='params' />
      <IntlField name='paramName' />
      <Lov name='targetParam' />
      <Switch name='isQueryCondition' />
      <TextField name='priority' />
      <TextField name='width' />
      <Select name='moduleType' />
      <Switch name='status' />
    </Form>
  );
};

export default React.memo(formatterCollections({
  code: ['hitf.InterfaceWorkplace', 'hitf.interfaceWorkplace'],
})(Create));
