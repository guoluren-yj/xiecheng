import { compose } from 'lodash';
import React, { Fragment, useCallback } from 'react';
import { Table, Form, Output, TextField, Select, DateTimePicker, TelField } from 'choerodon-ui/pro';

import formatterCollections from 'utils/intl/formatterCollections';
import { Button as PerButton } from 'components/Permission';
import intl from 'utils/intl';
import '@/routes/index.less';

const ComposeTable = ({
  tableFormDs,
  tableDs,
  columns,
  isEdit = false,
  code = '',
  formCode = '',
  customizeTable = () => {},
  customizeForm = () => {},
  custLoading = false,
  // handleAdd = () => {},
  reqId,
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

  // const buttons = [['add', { afterClick: handleAdd }], 'delete'];
  const buttons = [
    <PerButton
      name="add"
      type="c7n-pro"
      icon="add"
      onClick={() => {
        tableDs.create(
          {
            reqId,
          },
          0
        );
      }}
      permissionList={[
        {
          code: `srm.partner.buyer-apply-publish.supplier-apply-callback.api.button_sample_line_new`,
          type: 'button',
          meaning: '样品信息-行新建/删除按钮',
        },
      ]}
    >
      {intl.get('hzero.common.button.add').d('新增')}
    </PerButton>,
    <PerButton
      name="delete"
      type="c7n-pro"
      icon="delete"
      onClick={() => {
        tableDs.delete(tableDs.selected);
      }}
      permissionList={[
        {
          code: `srm.partner.buyer-apply-publish.supplier-apply-callback.api.button_sample_line_new`,
          type: 'button',
          meaning: '样品信息-行新建/删除按钮',
        },
      ]}
    >
      {intl.get('hzero.common.button.delete').d('删除')}
    </PerButton>,
  ];

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
          readOnly: !isEdit,
        },
        <Table
          dataSet={tableDs}
          columns={columns}
          data={[]}
          buttons={buttons}
          autoMaxWidth
          custLoading={custLoading}
        />
      )}
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.sample'],
  })
)(ComposeTable);
