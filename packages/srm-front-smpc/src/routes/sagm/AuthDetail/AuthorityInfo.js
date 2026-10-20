// 权限信息表单
import React, { memo } from 'react';
import { Tag } from 'choerodon-ui';
import { Form, Output } from 'choerodon-ui/pro';
import intl from 'utils/intl';

export default memo(function AuthorityInfo(props) {
  const { initDs } = props;

  return (
    <Form
      dataSet={initDs}
      columns={2}
      className="c7n-pro-vertical-form-display"
      labelLayout="vertical"
      style={{ width: '75%' }}
    >
      <Output name="authorityListCode" />
      <Output name="authorityListName" />
      <Output name="agreementTypeMeaning" />
      <Output name="agreementHeaderNum" />
      <Output name="realName" />
      <Output name="creationDate" />
      <Output
        name="statusCodeMeaning"
        renderer={({ record, text }) => {
          const statusCode = record?.get('statusCode');
          const color = ['EXECUTING', 'NEW'].includes(statusCode)
            ? 'orange'
            : ['PUBLISHED'].includes(statusCode)
            ? 'green'
            : 'gray';
          return text ? (
            <Tag color={color} style={{ border: 'none' }}>
              {text}
            </Tag>
          ) : (
            '-'
          );
        }}
      />
      <Output name="controlWayCodeMeaning" />
      <Output name="controlRangeMeaning" />
      <Output name="operationAuthMeaning" />
      <Output name="effectiveDate" />
      <Output name="remarkMeaning" />
      <Output
        name="enableFlag"
        renderer={({ value }) =>
          value
            ? intl.get('hzero.common.status.yes').d('是')
            : intl.get('hzero.common.status.no').d('否')
        }
      />
    </Form>
  );
});
