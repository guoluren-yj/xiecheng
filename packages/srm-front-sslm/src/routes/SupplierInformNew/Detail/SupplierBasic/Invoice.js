/*
 * Invoice - 开票信息
 * @Date: 2023-04-11 10:15:34
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, Spin } from 'choerodon-ui/pro';
import FormField from '@/routes/components/FormField';

const Invoice = ({ dataSet, custLoading, customizeForm, isEdit, isRead }) => {
  return (
    <Spin dataSet={dataSet}>
      {customizeForm(
        {
          code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.INVOICE',
          readOnly: isRead,
        },
        <Form
          columns={3}
          dataSet={dataSet}
          custLoading={custLoading}
          useWidthPercent
          labelLayout={isEdit ? 'float' : 'vertical'}
          className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
        >
          <FormField name="invoiceHeader" isEdit={isEdit} />
          <FormField name="taxRegistrationNumber" isEdit={isEdit} />
          <FormField name="taxRegistrationPhone" isEdit={isEdit} />
          <FormField
            rows={3}
            cols={2}
            colSpan={2}
            isEdit={isEdit}
            componentType="TEXTAREA"
            name="taxRegistrationAddress"
          />
          <FormField name="depositBank" isEdit={isEdit} newLine />
          <FormField
            isEdit
            readOnly={!isEdit}
            name="bankAccountNum"
            displayOutput={!isEdit}
            componentType="SECRETFIELD"
          />
          <FormField name="receiver" isEdit={isEdit} newLine />
          <FormField name="receiveMail" isEdit={isEdit} />
          <FormField name="receivePhone" isEdit={isEdit} componentType="TEL" />
          <FormField
            rows={3}
            cols={2}
            colSpan={2}
            isEdit={isEdit}
            name="receiveAddress"
            componentType="TEXTAREA"
          />
        </Form>
      )}
    </Spin>
  );
};

export default Invoice;
