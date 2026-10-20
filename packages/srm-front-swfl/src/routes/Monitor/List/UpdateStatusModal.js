import React from 'react';
import { Form, Select, TextArea } from 'choerodon-ui/pro';

import intl from 'utils/intl';

const Modal = ({ formRecord, text }) => {
  return (
    <div>
      <p>
        {intl
          .get('hwfp.monitor.view.content.processStatusUpdate1')
          .d(
            '该操作用于流程异常后修复状态，不会调用业务端接口更改流程对应单据的状态，且不会记录审批记录，'
          )}
        <span style={{ color: 'red' }}>
          {intl.get('hwfp.monitor.view.content.processStatusUpdate2').d('请谨慎操作！')}
        </span>
      </p>
      <p>
        {intl.get('hwfp.monitor.view.confirmUpdateStatus').d('是否确认更改流程')}： 【
        <span style={{ color: 'orange' }}>{text}</span>】
        {intl.get('hwfp.common.view.title.processStatus').d('流程状态')}。
      </p>
      <Form record={formRecord} useColon>
        <Select
          name="procStatus"
          optionsFilter={(record) => {
            return record && !['APPROVAL', 'SUSPENDED'].includes(record.get('value'));
          }}
        />
        <TextArea name="comment" />
      </Form>
    </div>
  );
};

export default Modal;
