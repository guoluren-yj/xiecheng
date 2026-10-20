import React from 'react';
import { Form } from 'choerodon-ui/pro';
import ConstructForm from './ConstructForm';
import { StatusRender } from '../../../utils';

const Index = (props) => {
  const { isEdit = true, dataSet, formulaId } = props;
  return (
    <Form
      useWidthPercent
      labelLayout={isEdit ? 'float' : 'vertical'}
      className={isEdit ? null : 'c7n-pro-vertical-form-display'}
      dataSet={dataSet}
      columns={3}
    >
      <ConstructForm formType="TextField" disabled isEdit={isEdit} name="formulaCode" />
      <ConstructForm formType="IntlField" isEdit={isEdit} name="formulaName" />
      <ConstructForm formType="Lov" disabled={formulaId} isEdit={isEdit} name="bomStructureId" />
      <ConstructForm
        formType="TextField"
        name="formulaStatusCode"
        isEdit={isEdit}
        disabled
        {...(isEdit
          ? {}
          : {
              renderer: ({ value, record }) =>
                StatusRender(value, record.get('formulaStatusCodeMeaning')),
            })}
      />
      <ConstructForm
        formType="Select"
        disabled={formulaId}
        isEdit={isEdit}
        name="formulaTypeCode"
      />
      <ConstructForm
        formType="TextField"
        isEdit={isEdit}
        disabled
        name="createdBy"
        renderer={({ record }) => record.get('creationRealName')}
      />
      <ConstructForm formType="TextField" isEdit={isEdit} disabled name="versionNum" />
    </Form>
  );
};

export default Index;
