import React from 'react';
import { Form } from 'choerodon-ui/pro';
import FormField from '@/routes/components/FormField';

export default function SupplierCategoryModal({ dataSet, customizeForm, type }) {
  return customizeForm(
    {
      code: 'SSLM.SUPPLIER_CATEGORY_LIST_NEW.MODAL_FORM',
    },
    <Form labelLayout="float" dataSet={dataSet}>
      <FormField name="categoryCode" componentType="Input" isEdit />
      <FormField name="categoryDescription" componentType="IntlField" isEdit />
      {(type === 'newTop' || dataSet.current?.get('parentCategoryId') === 0) && (
        <FormField name="multiFlag" componentType="CheckBox" isEdit showHelp="tooltip" />
      )}
      <FormField name="introCategoryFlag" componentType="CheckBox" isEdit showHelp="tooltip" />
      <FormField name="synergyFlag" componentType="CheckBox" isEdit showHelp="tooltip" />
    </Form>
  );
}
