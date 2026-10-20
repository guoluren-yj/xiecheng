/**
 * 配置表定义 - 定义动作 - 表单
 * ActionEditForm.js
 * @date: 2021-12-6
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useState } from 'react';
import { Form, Select, TextField, TextArea } from 'choerodon-ui/pro';

function ActionEditForm(props = {}) {
  const { ds } = props;
  const [isShow, handleShowHide] = useState(
    ds.get('type') === 'LINE_BUTTON' || ds.get('type') === 'HEAD_BUTTON'
  );
  const changeType = (typeName) => {
    handleShowHide(typeName === 'LINE_BUTTON' || typeName === 'HEAD_BUTTON');
  };
  return (
    <Form record={ds} labelLayout="float">
      <Select name="type" onChange={changeType} />
      <Select name="position" />
      {isShow && <Select name="event" />}
      {isShow && <TextField name="name" />}
      <TextArea name="description" />
    </Form>
  );
}

export default ActionEditForm;
