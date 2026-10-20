import React from 'react';
import {
  Form,
  TextField,
  Output,
  Lov,
  Attachment,
  TextArea,
  DateTimePicker,
  EmailField,
  Spin,
  TelField,
} from 'choerodon-ui/pro';
import { PRIVATE_BUCKET } from '_utils/config';

import '@/routes/index.less';

const EntryBaseInfo = ({
  dataSet,
  isEdit,
  customizeForm,
  pubEditFlag,
  custLoading,
  customizeUnitCode,
}) => {
  return (
    <Spin dataSet={dataSet}>
      {customizeForm(
        {
          code: customizeUnitCode,
          enableCreate: false,
          labelLayout: isEdit ? 'float' : 'vertical',
          readOnly: !(isEdit || pubEditFlag),
          enableReLoad: false,
        },
        <Form
          dataSet={dataSet}
          columns={3}
          useWidthPercent
          labelLayout={isEdit ? 'float' : 'vertical'}
          className={isEdit ? 'form-tel-field-disable' : 'c7n-pro-vertical-form-display'}
          custLoading={custLoading}
        >
          {isEdit ? <TextField name="changeReqNumber" /> : <Output name="changeReqNumber" />}
          {isEdit ? <TextField name="createUserName" /> : <Output name="createUserName" />}
          {isEdit ? <Lov name="departmentObj" /> : <Output name="departmentObj" />}
          {isEdit ? <DateTimePicker name="creationDate" /> : <Output name="creationDate" />}
          {isEdit ? <TextField name="realName" /> : <Output name="realName" />}
          {isEdit ? (
            // 密码禁止输入中文和中文字符
            // eslint-disable-next-line no-control-regex
            <TextField name="password" restrict={/[^\x00-\xff]/g} />
          ) : (
            <Output name="password" />
          )}
          {isEdit ? <TelField name="phone" /> : <Output name="phone" />}
          {isEdit ? <EmailField name="email" /> : <Output name="email" />}
          {isEdit ? <Lov name="timeZone" /> : <Output name="timeZone" />}
          {isEdit ? <Lov name="language" /> : <Output name="language" />}
          <Attachment
            name="attachmentUuid"
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="spfm-comp"
            readOnly={!isEdit}
          />

          {isEdit ? (
            <TextArea colSpan={2} name="remark" resize="both" newLine />
          ) : (
            <Output colSpan={2} name="remark" newLine />
          )}
        </Form>
      )}
    </Spin>
  );
};

export default EntryBaseInfo;
