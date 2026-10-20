/**
 * InvoiceInfo - 开票
 * @date: 2022-03-27
 * @author: 杨一昊 <yihao.yang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useEffect } from 'react';
import { Form, TextField, TelField, Output, Spin, SecretField } from 'choerodon-ui/pro';

import '@/routes/index.less';

const InvoiceInfo = ({
  dataSet,
  isEdit: editFlag,
  customizeForm,
  custLoading,
  disabledObj = {},
  customizeUnitCode,
}) => {
  const { allDisabled } = disabledObj;
  const isEdit = editFlag && !allDisabled;

  useEffect(() => {
    dataSet.query();
  }, [dataSet]);
  return (
    <div>
      <Spin dataSet={dataSet}>
        {customizeForm(
          {
            code: customizeUnitCode,
            enableCreate: false,
            labelLayout: isEdit ? 'float' : 'vertical',
            readOnly: !isEdit,
            enableReLoad: false,
          },
          <Form
            useWidthPercent
            dataSet={dataSet}
            columns={3}
            labelLayout={isEdit ? 'float' : 'vertical'}
            custLoading={custLoading}
            className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
          >
            {isEdit ? <TextField name="invoiceHeader" /> : <Output name="invoiceHeader" />}
            {isEdit ? (
              <TextField
                name="taxRegistrationNumber"
                // disabled={domesticFlag && !personalFlag}
              />
            ) : (
              <Output name="taxRegistrationNumber" />
            )}
            {isEdit ? <TextField name="depositBank" /> : <Output name="depositBank" />}
            <SecretField
              name="bankAccountNum"
              readOnly={!isEdit}
              border={isEdit}
              displayOutput={!isEdit}
            />
            {isEdit ? (
              <TextField name="taxRegistrationAddress" />
            ) : (
              <Output name="taxRegistrationAddress" />
            )}
            {isEdit ? (
              <TextField name="taxRegistrationPhone" />
            ) : (
              <Output name="taxRegistrationPhone" />
            )}
            {isEdit ? <TextField name="receiver" /> : <Output name="receiver" />}
            {isEdit ? <TextField name="receiveMail" /> : <Output name="receiveMail" />}
            {isEdit ? <TelField name="receivePhone" /> : <Output name="receivePhone" />}
            {isEdit ? <TextField name="receiveAddress" /> : <Output name="receiveAddress" />}
          </Form>
        )}
      </Spin>
    </div>
  );
};

export default InvoiceInfo;
