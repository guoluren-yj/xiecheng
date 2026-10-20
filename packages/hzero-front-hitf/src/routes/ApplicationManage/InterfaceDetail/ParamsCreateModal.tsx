import React, { useCallback } from 'react';
import { Form, DataSet, TextField, Select } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';


import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';

interface ParamsCreateModalProps {
  formDs: DataSet,
  type: String,
}

const ParamsCreateModal: React.FC<ParamsCreateModalProps> = ({ formDs, type }) => {
  const handleFilter = useCallback((record) => {
    return record.get('value') !== 'MAIN';
  }, []);

  return (
    <Form dataSet={formDs} labelLayout={LabelLayout.float}>
      <TextField name="paramHeaderCode" disabled={type === 'rename'} restrict={/[\u4e00-\u9fa5]/g} />
      <TextField name="paramHeaderName" />
      <Select name="relationType" disabled={type === 'rename' || type === 'create'} optionsFilter={handleFilter} />
      <Select name="paramType" disabled={type === 'rename'} />
      <Select name="notNull" clearButton={false} />
    </Form>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application'],
})(ParamsCreateModal));
