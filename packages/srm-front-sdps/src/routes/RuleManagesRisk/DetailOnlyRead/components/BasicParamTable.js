/**
 * 规则配置详情 - 基本参数（只读）（平台级）
 * @date: 2021-01-04
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Form, TextField, Select, CheckBox, IntlField } from 'choerodon-ui/pro';

export default function BasicParam(props = {}) {
  const { formDs } = props;

  return (
    <Form dataSet={formDs} labelLayout="float" columns={3}>
      <TextField name="ruleCode" colSpan={1} disabled />
      <IntlField name="ruleName" colSpan={1} disabled />
      <Select name="ruleType" colSpan={1} disabled />
      <TextField name="themeCode" colSpan={1} disabled />
      <CheckBox name="chooseFlag" colSpan={1} disabled />
      <IntlField
        name="description"
        type="multipleLine"
        colSpan={3}
        newLine
        showLengthInfo
        rows={3}
      />
      {/* {formDs.current?.get('type') === '1' && (
        <Fragment>
          <Lov name="service" colSpan={1} disabled />
          <TextField name="serviceCode" colSpan={1} disabled />
          <TextField name="servicePath" colSpan={1} disabled />
        </Fragment>
      )}
      {formDs.current?.get('type') !== '1' && <Select name="defaultRet" colSpan={1} disabled />}
      <Select name="defaultRetLine" colSpan={1} disabled />
      {formDs.current?.get('type') !== '1' && (
        <Fragment>
          <Select name="defaultRetEmpty" colSpan={1} disabled />
          <NumberField name="retEmpty" colSpan={1} disabled />
        </Fragment>
      )}
      <Select name="defaultRetFail" colSpan={1} disabled />
       */}
    </Form>
  );
}
