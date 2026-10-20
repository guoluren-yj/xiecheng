/**
 * 参数配置 - 单条参数配置弹框Form组件
 * @date: 2021-09-06
 * @author: Zepeng Huang <zepeng.Huang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */
import React, { useState } from 'react';
import { Form, Select, IntlField, TextField } from 'choerodon-ui/pro';

export default function ParamManageForm(props) {
  const { record } = props;

  const [showExpressionFrame, handleShowExpressionFrame] = useState(
    record.get('paramType') === 'transform_parameter'
  );

  /**
   * 根据paramType字段处理expression字段的显隐
   */
  const handleTypeChange = () => {
    if (record.get('paramType') === 'transform_parameter') {
      handleShowExpressionFrame(true);
    } else handleShowExpressionFrame(false);
  };

  return (
    <Form record={record} labelLayout="float" columns={2}>
      <TextField name="parameterKey" colSpan={1} disabled={record.get('parameterId')} />
      <IntlField name="parameterName" colSpan={1} />
      <Select
        name="paramType"
        colSpan={1}
        onChange={handleTypeChange}
        disabled={record.get('parameterId')}
      />
      <Select name="dataType" colSpan={1} />
      <IntlField name="description" type="multipleLine" colSpan={2} rows={3} />
      {showExpressionFrame && (
        <TextField name="expression" colSpan={2} rows={3} disabled={record.get('parameterId')} />
      )}
    </Form>
  );
}
