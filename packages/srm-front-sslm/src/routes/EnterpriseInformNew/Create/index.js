/*
 * HeaderInfo - 基础信息
 * @Date: 2023-08-25 10:19:06
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, Select, Lov } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

const CreateForm = observer(({ dataSet, custLoading, customizeForm, code = '' }) => {
  return customizeForm(
    {
      code,
    },
    <Form dataSet={dataSet} labelLayout="float" custLoading={custLoading}>
      <Lov name="companyId" />
      <Select name="changeContent" />
      <Select name="changeLevel" hidden={!(dataSet.current.get('changeContent') === 'purchaser')} />
      <Lov name="partnerCompanyId" hidden={!dataSet.current.get('changeLevel')} />
    </Form>
  );
});

export default CreateForm;
