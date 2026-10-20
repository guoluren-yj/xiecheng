import React from 'react';
import { Form } from 'choerodon-ui/pro';
import { StatusRender } from '@/routes/spc/FormulaManage/utils';
import ConstructForm from './ConstructForm';

const Index = (props) => {
  const { isEdit = true, dataSet } = props;
  return (
    <Form
      useWidthPercent
      labelLayout={isEdit ? "float" : "vertical"}
      className={isEdit ? null : 'c7n-pro-vertical-form-display'}
      dataSet={dataSet}
      columns={3}
    >
      <ConstructForm
        formType="TextField"
        disabled
        isEdit={isEdit}
        name="bomTemplateCode"
      />
      <ConstructForm
        formType="TextField"
        isEdit={isEdit}
        name="bomTemplateName"
      />
      <ConstructForm
        formType="TextField"
        disabled
        isEdit={isEdit}
        name="createdName"
      />
      <ConstructForm
        formType="DatePicker"
        disabled
        isEdit={isEdit}
        name="creationDate"
      />
      <ConstructForm
        formType="TextField"
        disabled
        isEdit={isEdit}
        name="bomTemplateStatus"
        {...isEdit ? {} : {
          renderer: ({ value, record }) => (
            StatusRender(value, record.get('bomTemplateStatusMeaning'))
          ),
        }}
      />
      <ConstructForm
        formType="TextField"
        isEdit={isEdit}
        disabled
        name="bomTemplateVersion"
      />
    </Form>
  );
};

export default Index;
