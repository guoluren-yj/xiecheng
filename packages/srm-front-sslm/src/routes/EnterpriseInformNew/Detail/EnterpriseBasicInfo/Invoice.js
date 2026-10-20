/*
 * Invoice - 开票信息
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback } from 'react';
import { Form, Spin } from 'choerodon-ui/pro';
import FormField from '@/routes/components/FormField';

const Invoice = ({
  dataSet,
  custLoading,
  customizeForm,
  isEdit,
  getFieldProps = () => {},
  code = '',
}) => {
  // 处理字段渲染
  const handleFieldRender = useCallback(
    ({ fieldName, type, hidden = false } = {}) => {
      const renderProps = getFieldProps({
        currentRecord: dataSet.current,
        fieldName,
        type,
        hidden,
      });
      return renderProps;
    },
    [dataSet]
  );

  return (
    <Spin dataSet={dataSet}>
      {customizeForm(
        {
          code,
          readOnly: !isEdit,
        },
        <Form
          useWidthPercent
          columns={3}
          dataSet={dataSet}
          custLoading={custLoading}
          labelLayout={isEdit ? 'float' : 'vertical'}
          className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
        >
          <FormField
            name="invoiceHeader"
            isEdit={isEdit}
            {...handleFieldRender({ fieldName: 'invoiceHeader' })}
          />
          <FormField
            name="taxRegistrationNumber"
            isEdit={isEdit}
            {...handleFieldRender({
              fieldName: 'taxRegistrationNumber',
            })}
          />
          <FormField
            name="taxRegistrationPhone"
            isEdit={isEdit}
            {...handleFieldRender({
              fieldName: 'taxRegistrationPhone',
            })}
          />
          <FormField
            rows={3}
            cols={2}
            colSpan={2}
            isEdit={isEdit}
            componentType="TEXTAREA"
            name="taxRegistrationAddress"
            {...handleFieldRender({
              fieldName: 'taxRegistrationAddress',
            })}
            newLine
          />
          <FormField
            name="depositBank"
            isEdit={isEdit}
            newLine
            {...handleFieldRender({ fieldName: 'depositBank' })}
          />
          <FormField
            name="bankAccountNum"
            isEdit={isEdit}
            {...handleFieldRender({ fieldName: 'bankAccountNum' })}
          />
          <FormField
            name="receiver"
            isEdit={isEdit}
            newLine
            {...handleFieldRender({ fieldName: 'receiver' })}
          />
          <FormField
            name="receiveMail"
            isEdit={isEdit}
            {...handleFieldRender({ fieldName: 'receiveMail' })}
          />
          <FormField
            name="receivePhone"
            isEdit={isEdit}
            componentType="TEL"
            {...handleFieldRender({
              fieldName: 'receivePhone',
            })}
          />
          <FormField
            rows={3}
            cols={2}
            colSpan={2}
            isEdit={isEdit}
            name="receiveAddress"
            componentType="TEXTAREA"
            {...handleFieldRender({ fieldName: 'receiveAddress' })}
          />
        </Form>
      )}
    </Spin>
  );
};

export default Invoice;
