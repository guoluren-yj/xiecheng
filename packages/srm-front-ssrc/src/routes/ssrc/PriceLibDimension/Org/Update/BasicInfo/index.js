import React from 'react';
import { Form } from 'choerodon-ui/pro';
import ConstructForm from '../../ConstructForm';
import { StatusRender } from '../../utils';

const Index = (props) => {
  const { isEdit = true, dataSet, templateId } = props;
  return (
    <Form
      useWidthPercent
      labelLayout={isEdit ? "float" : "vertical"}
      className={isEdit ? null : 'c7n-pro-vertical-form-display'}
      dataSet={dataSet}
      columns={3}
    >
      <ConstructForm formType="TextField" disabled={templateId} isEdit={isEdit} name="templateCode" />
      <ConstructForm formType="IntlField" isEdit={isEdit} name="templateName" />
      <ConstructForm
        formType="TextField"
        name="templateStatus"
        isEdit={isEdit}
        disabled
        {...isEdit ? {} : {
          renderer: ({ value, record }) => (
            StatusRender(value, record.get('templateStatusMeaning'))
          ),
        }
        }
      />
      <ConstructForm formType="Select" isEdit={isEdit} disabled name="templateType" />
      <ConstructForm formType="TextField" isEdit={isEdit} disabled name="versionNum" />
      <ConstructForm formType="TextField" isEdit={isEdit} disabled name="realName" />
      <ConstructForm formType="TextField" isEdit={isEdit} disabled name="creationDate" />
      <ConstructForm formType="TextArea" newLine colSpan={2} resize="vertical" isEdit={isEdit} name="remark" />

    </Form>
  );
};

export default Index;
