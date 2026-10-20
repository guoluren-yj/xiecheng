/*
 * Invoice - 开票信息
 * @Date: 2023-04-11 10:15:34
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, Spin, Output } from 'choerodon-ui/pro';
import FormField from '@/routes/components/FormField';
import { handleExtTextRenderIntercept } from '@/routes/components/utils';

const Invoice = ({
  dataSet,
  custLoading,
  customizeForm,
  handleCompareRender,
  customizeUnitCode,
  handleFieldProp = () => {},
}) => {
  const fields = [
    {
      name: 'invoiceHeader',
    },
    {
      name: 'taxRegistrationNumber',
    },
    {
      name: 'taxRegistrationPhone',
    },
    {
      name: 'taxRegistrationAddress',
      newLine: true,
      colSpan: 2,
    },
    {
      name: 'depositBank',
    },
    {
      name: 'bankAccountNum',
      renderer: ({ record, name }) => {
        return (
          <span style={{ color: record && record.get(`${name}Flag`) === 'UPDATE' && 'red' }}>
            <FormField
              isEdit
              readOnly
              displayOutput
              name="bankAccountNum"
              componentType="SECRETFIELD"
            />
          </span>
        );
      },
    },
    {
      name: 'receiver',
    },
    {
      name: 'receiveMail',
    },
    {
      name: 'receivePhone',
    },
    {
      name: 'receiveAddress',
      newLine: true,
      colSpan: 2,
    },
  ].map(field => {
    const { type, displayField, ...others } = field;
    const { name: fileName, hidden } = others;
    return {
      renderer: ({ value, record, name }) =>
        handleCompareRender({ value, record, name, type, displayField }),
      ...handleFieldProp({ currentRecord: dataSet && dataSet.current, fileName, hidden }),
      ...others,
    };
  });
  return (
    <Spin dataSet={dataSet}>
      {customizeForm(
        {
          code: customizeUnitCode,
          readOnly: true,
          extTextRenderIntercept: handleExtTextRenderIntercept,
        },
        <Form
          columns={3}
          dataSet={dataSet}
          custLoading={custLoading}
          style={{ width: '90%', maxWidth: 1172 }}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
        >
          {fields.map(filed => (
            <Output {...filed} />
          ))}
        </Form>
      )}
    </Spin>
  );
};

export default Invoice;
