/**
 * 规则配置详情 - 基本参数
 * @date: 2021-06-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useState, useEffect } from 'react';
import { Form, TextField, Select, Lov, TextArea, NumberField } from 'choerodon-ui/pro';

export default function BasicParam(props = {}) {
  const { formDs, metaDefinitionId } = props;

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
      <TextField name="fullPathCode" colSpan={1} disabled={metaDefinitionId !== undefined} />
      <TextField name="name" colSpan={1} />
      <Select name="type" colSpan={1} />
      <Lov name="service" colSpan={1} />
      <TextField name="serviceCode" disabled colSpan={1} />
      <TextField name="servicePath" disabled colSpan={1} />
      <Select name="defaultRet" colSpan={1} />
      <Select name="defaultRetLine" colSpan={1} />
      <Select name="defaultRetEmpty" colSpan={1} onChange={handleDefaultRetEmptyChange} />
      <NumberField name="retEmpty" colSpan={1} disabled={disableRetEmpty} />
      <Select name="defaultRetFail" colSpan={1} />
      <TextArea name="description" colSpan={3} newLine />
    </Form>
  );
}
