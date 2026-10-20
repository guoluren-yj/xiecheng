import React, { Fragment, useCallback } from 'react';
import { Table, Form, Output, TextField, Select, DateTimePicker, TelField } from 'choerodon-ui/pro';

import '@/routes/index.less';

const ComposeTable = ({
  tableFormDs,
  tableDs,
  columns,
  isEdit = false,
  code = '',
  formCode = '',
  customizeForm = () => {},
  customizeTable = () => {},
  custLoading = false,
  confirmEdit = false,
  pubEditFlag = false,
}) => {
  // 预计送达时间回调
  const handleFormChange = useCallback((val, fieldCode) => {
    tableDs.forEach(record => {
      const sendTypeCode = record.get('sendTypeCode');
      if (fieldCode === 'trackingNumber' && sendTypeCode === 'EXPRESS_DELIVERY') {
        record.set(fieldCode, val);
      }
      if (fieldCode !== 'trackingNumber') {
        record.set(fieldCode, val);
      }
    });
  }, []);

  return (
    <Fragment>
      {customizeForm(
        {
          code: formCode,
        },
        <Form
          dataSet={tableFormDs}
          columns={3}
          labelWidth={130}
          className="addon-before-style"
          custLoading={custLoading}
          labelAlign="left"
        >
          {isEdit ? <TextField name="sendUserName" /> : <Output name="sendUserName" />}
          {isEdit ? <TelField name="sendUserPhone" /> : <Output name="sendUserPhone" />}
          {isEdit ? (
            <DateTimePicker
              name="expectedDeliveryDate"
              onChange={val => handleFormChange(val, 'expectedDeliveryDate')}
            />
          ) : (
            <Output name="expectedDeliveryDate" />
          )}
          {isEdit ? (
            <Select name="sendTypeCode" onChange={val => handleFormChange(val, 'sendTypeCode')} />
          ) : (
            <Output name="sendTypeCode" />
          )}
          {isEdit ? (
            <TextField
              name="trackingNumber"
              restrict="a-z,A-Z,0-9,-"
              onChange={val => handleFormChange(val, 'trackingNumber')}
            />
          ) : (
            <Output name="trackingNumber" />
          )}
          {isEdit ? <TextField name="supplierRemark" /> : <Output name="supplierRemark" />}
        </Form>
      )}
      {customizeTable(
        {
          code,
          readOnly: !(isEdit || confirmEdit || pubEditFlag),
          __force_record_to_update__: true,
        },
        <Table
          dataSet={tableDs}
          columns={columns}
          data={[]}
          autoMaxWidth
          custLoading={custLoading}
        />
      )}
    </Fragment>
  );
};

export default ComposeTable;
