/*
 * GeneralForm - 通用form
 * @Date: 2023-12-26 16:22:04
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form } from 'choerodon-ui/pro';
import FormField from '@/routes/components/FormField';

const GeneralForm = ({
  dataSet,
  isEdit,
  fields,
  columns = 3,
  style = {},
  custLoading,
  readOnlyFlag,
  customizeForm,
  customizeUnitCode,
  useWidthPercent = true,
}) => {
  const FormContent = (
    <Form
      style={style}
      dataSet={dataSet}
      columns={columns}
      custLoading={custLoading}
      useWidthPercent={useWidthPercent}
      labelLayout={isEdit ? 'float' : 'vertical'}
      className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
    >
      {fields.map(field => (
        <FormField isEdit={isEdit} {...field} />
      ))}
    </Form>
  );
  return customizeForm
    ? customizeForm(
        {
          code: customizeUnitCode,
          readOnly: readOnlyFlag,
        },
        FormContent
      )
    : FormContent;
};

export default GeneralForm;
