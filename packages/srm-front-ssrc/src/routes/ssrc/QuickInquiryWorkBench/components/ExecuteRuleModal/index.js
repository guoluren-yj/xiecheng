import React from 'react';
import { Alert } from 'choerodon-ui';
import { Form, Select } from 'choerodon-ui/pro';

import intl from 'utils/intl';

export default function ExecuteRuleModal(props) {
  const { dataSet, batchEditFlag = false } = props || {};

  // 过滤执行规则
  const optionsFilterResultExecuteRule = (optionRecord) => {
    const optionValue = optionRecord.get('value') || null;
    return optionValue !== 'MANUAL';
  };

  return (
    <>
      <Alert
        message={
          batchEditFlag
            ? intl
                .get('ssrc.quickInquiry.view.message.batchChooseExecuteRule.tips')
                .d('已勾选行数据的执行规则不一致或为空，需指定执行规则。')
            : intl
                .get('ssrc.quickInquiry.view.message.chooseExecuteRule.tips')
                .d('当前行执行规则为空，需指定执行规则。')
        }
        type="info"
        iconType="help"
        style={{
          color: '#0161D5',
          background: 'rgba(25, 132, 247, 0.10)',
        }}
        closable
        showIcon
        banner
      />
      <div style={{ padding: '16px 20px 20px 20px' }}>
        <Form dataSet={dataSet} columns={1} labelLayout="float">
          <Select
            name="resultExecuteRule"
            optionsFilter={optionsFilterResultExecuteRule}
            clearButton={false}
          />
        </Form>
      </div>
    </>
  );
}
