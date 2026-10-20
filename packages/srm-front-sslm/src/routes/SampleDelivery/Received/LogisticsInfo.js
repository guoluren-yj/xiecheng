/**
 * LogisticsInfo.js - 物流信息补录
 * @date: 2021-01-25
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useCallback } from 'react';
import { Form, Table, Select, TextField, Spin, DateTimePicker, TelField } from 'choerodon-ui/pro';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import { PRIVATE_BUCKET } from '_utils/config';
import '@/routes/index.less';

const LogisticsInfo = ({ logisticsFormDs, logisticsTableDs }) => {
  // 值改变时的回调
  const hanldeValueChange = useCallback((val, fieldCode) => {
    logisticsTableDs.forEach(record => {
      const sendTypeCode = record.get('sendTypeCode');
      if (fieldCode === 'trackingNumber' && sendTypeCode === 'EXPRESS_DELIVERY') {
        record.set(fieldCode, val);
      }
      if (fieldCode === 'sendTypeCode') {
        record.set(fieldCode, val);
      }
      if (fieldCode === 'expectedDeliveryDate') {
        record.set(fieldCode, val);
      }
    });
  }, []);

  const columns = [
    {
      name: 'itemCode',
      width: 160,
      tooltip: 'overflow',
    },
    {
      name: 'itemName',
      width: 180,
      tooltip: 'overflow',
    },
    {
      name: 'expectedDeliveryDate',
      width: 180,
      editor: true,
    },
    {
      name: 'sendTypeCode',
      editor: true,
      width: 120,
    },
    {
      name: 'trackingNumber',
      editor: record =>
        record.get('sendTypeCode') === 'EXPRESS_DELIVERY' && <TextField restrict="a-z,A-Z,0-9,-" />,
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'attachmentUuid',
      width: 120,
      renderer: ({ record }) => {
        return (
          <Upload
            bucketName={PRIVATE_BUCKET}
            attachmentUUID={record.get('attachmentUuid')}
            afterOpenUploadModal={attUuid => {
              record.set('attachmentUuid', attUuid);
            }}
            filePreview
          />
        );
      },
    },
  ];

  return (
    <Fragment>
      <Spin dataSet={logisticsFormDs}>
        <Form dataSet={logisticsFormDs} columns={3} className="addon-before-style">
          <TextField name="sendUserName" />
          <TelField name="sendUserPhone" />
          <DateTimePicker
            name="expectedDeliveryDate"
            onChange={val => hanldeValueChange(val, 'expectedDeliveryDate')}
          />
          <Select name="sendTypeCode" onChange={val => hanldeValueChange(val, 'sendTypeCode')} />
          <TextField
            name="trackingNumber"
            restrict="a-z,A-Z,0-9,-"
            onChange={val => hanldeValueChange(val, 'trackingNumber')}
          />
          <TextField name="supplierRemark" />
        </Form>
      </Spin>
      <Table dataSet={logisticsTableDs} columns={columns} />
    </Fragment>
  );
};

export default LogisticsInfo;
