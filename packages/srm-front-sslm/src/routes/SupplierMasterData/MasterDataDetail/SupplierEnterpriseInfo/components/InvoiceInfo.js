/*
 * InvoiceInfo - 开票信息
 * @Date: 2023-08-17 09:30:33
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect, useContext } from 'react';
import { Form, Output, SecretField, useDataSet } from 'choerodon-ui/pro';

import { Context } from '@/routes/SupplierMasterData/Context';
import { getInvoiceDS } from '../stores/getInvoiceDS';

const customizeCode = '';

const InvoiceInfo = () => {
  const context = useContext(Context);
  const { enterpriseBasicInfo: { invoice = {} } = {}, customizeForm } = context;
  const dataSet = useDataSet(() => getInvoiceDS(), []);

  useEffect(() => {
    dataSet.loadData([invoice]);
  });

  const fields = [
    {
      name: 'invoiceHeader',
    },
    {
      name: 'taxRegistrationNumber',
    },
    {
      name: 'depositBank',
    },
    {
      name: 'bankAccountNum',
    },
    {
      name: 'taxRegistrationAddress',
    },
    {
      name: 'taxRegistrationPhone',
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
    },
  ];
  return customizeForm(
    {
      code: customizeCode,
      readOnly: true,
    },
    <Form
      columns={3}
      dataSet={dataSet}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
    >
      {fields.map(field => {
        if (field.name === 'bankAccountNum') {
          return <SecretField readOnly displayOutput name="bankAccountNum" />;
        } else {
          return <Output {...field} />;
        }
      })}
    </Form>
  );
};

export default InvoiceInfo;
