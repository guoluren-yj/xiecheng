import React from 'react';
import { Tag } from 'choerodon-ui';
import { Form, IntlField, Output, Spin, TextArea, TextField } from 'choerodon-ui/pro';


function BaseInfo({
  dataSet,
  readOnly,
}) {
  function showStatusTag(record) {
    const { status, statusMeaning } = record?.get(["status", "statusMeaning"]) || {};
    let color;
    switch (status) {
      case 'PUBLISHED':
        color = 'green';
        break;
      case 'UNPUBLISHED':
        color = 'yellow';
        break;
      case 'DISABLED':
        color = 'red';
        break;
      case 'INVALID':
        color = 'gray';
        break;
      default:
        break;
    }
    return (
      <Tag
        color={color}
        border={false}
      >
        {statusMeaning}
      </Tag>
    );
  }
  return (
    <Spin dataSet={dataSet}>
      <Form
        dataSet={dataSet}
        useWidthPercent
        columns={3}
        labelLayout={readOnly ? 'vertical' : 'float'}
        className={readOnly ? 'c7n-pro-vertical-form-display' : ''}
      >
        {readOnly ? (
          <>
            <Output name="templateCode" />
            <Output name="templateName" />
            <Output name="status" renderer={({record}) => showStatusTag(record)} />
            <Output name="version" />
            <Output name="remark" />
          </>
        ) : (
          <>
            <TextField disabled name="templateCode" />
            <IntlField name="templateName" />
            <TextField disabled name="version" />
            <TextArea name="remark" colSpan={2} resize="vertical" />
          </>
        )}
      </Form>
    </Spin>
  );
}

export default BaseInfo;
