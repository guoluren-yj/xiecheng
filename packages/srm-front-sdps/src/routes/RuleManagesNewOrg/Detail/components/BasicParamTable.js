/**
 * 规则配置详情 - 基本参数（租户级）
 * @date: 2021-01-04
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useState, useEffect, Fragment } from 'react';
import { Form, TextField, Select, NumberField, Lov, IntlField } from 'choerodon-ui/pro';

export default function BasicParam(props = {}) {
  const { formDs } = props;

  const [disableRetEmpty, handleDisableRetEmpty] = useState(false); // 控制空参缺省值的disable

  /**
   * 当formDs.current变化时重新渲染
   */
  useEffect(() => {
    if (
      formDs.current?.get('defaultRetEmpty') !== 'empty_default' &&
      formDs.current?.get('defaultRetEmpty')
    ) {
      formDs.current.set('retEmpty', null);
      handleDisableRetEmpty(true);
      return;
    }
    handleDisableRetEmpty(false);
  }, [formDs.current]);

  /**
   * 根据defaultRetEmpty值确定retEmpty字段是否可编辑
   */
  const handleDefaultRetEmptyChange = () => {
    if (formDs.current.get('defaultRetEmpty') !== 'empty_default') {
      formDs.current.set('retEmpty', null);
      handleDisableRetEmpty(true);
      return;
    }
    // 回复置空时要还原为原来的值
    formDs.current.set('retEmpty', formDs.current.getPristineValue('retEmpty'));
    handleDisableRetEmpty(false);
  };

  return (
    <Form dataSet={formDs} labelLayout="float" columns={3}>
      <TextField name="ruleCode" colSpan={1} disabled />
      <IntlField name="name" colSpan={1} />
      <Select name="type" colSpan={1} disabled />
      {formDs.current?.get('type') === '1' && (
        <Fragment>
          <Lov name="service" colSpan={1} disabled />
          <TextField name="serviceCode" colSpan={1} disabled />
          <TextField name="servicePath" colSpan={1} disabled />
        </Fragment>
      )}
      {formDs.current?.get('type') !== '1' && <Select name="defaultRet" disabled colSpan={1} />}
      <Select name="defaultRetLine" colSpan={1} disabled />
      {formDs.current?.get('type') !== '1' && (
        <Fragment>
          <Select name="defaultRetEmpty" colSpan={1} onChange={handleDefaultRetEmptyChange} />
          <NumberField name="retEmpty" colSpan={1} disabled={disableRetEmpty} />
        </Fragment>
      )}
      <Select name="defaultRetFail" colSpan={1} />
      <IntlField name="description" type="multipleLine" rows={3} colSpan={3} newLine disabled />
    </Form>
  );
}
