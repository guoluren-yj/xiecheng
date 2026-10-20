/*
 * @Date: 2022-10-18 17:17:59
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, Select } from 'choerodon-ui/pro';

const CreateForm = ({ dataSet, startStrategyStageDescription }) => {
  return (
    <Form labelLayout="float" dataSet={dataSet}>
      {/* 处理开始阶段显示id问题，不知道为什么有的时候自动翻译有的时候没自动翻译 */}
      <Select name="startStrategyStageId" renderer={() => startStrategyStageDescription} />
      <Select name="endStrategyStageId" />
    </Form>
  );
};

export default CreateForm;
