/*
 * @Date: 2023-07-11 15:14:43
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { compose } from 'lodash';
import React from 'react';
import { Form, TextField, Lov, Select, Output, TelField } from 'choerodon-ui/pro';

import formatterCollections from 'utils/intl/formatterCollections';
import '@/routes/index.less';

const HeaderInfo = ({ formDs, isEdit, customizeForm, custLoading, code = '' }) => {
  return customizeForm(
    {
      code,
      readOnly: !isEdit,
    },
    <Form
      dataSet={formDs}
      columns={3}
      labelWidth={130}
      custLoading={custLoading}
      className="addon-before-style"
      labelAlign="left"
    >
      <Output name="reqNum" />
      <Output name="reqUserName" />
      <Output name="reqStatus" />
      {!isEdit ? <Output name="company" /> : <Lov name="company" noCache />}
      {!isEdit ? <Output name="supplier" /> : <Lov name="supplier" noCache />}
      {!isEdit ? <Output name="supplierTypeCode" /> : <Select name="supplierTypeCode" />}
      <Output name="creationDate" />
      {!isEdit ? <Output name="originFactoryName" /> : <TextField name="originFactoryName" />}
      {!isEdit ? <Output name="typeCode" /> : <Select name="typeCode" />}
      {!isEdit ? <Output name="urgencyDegree" /> : <Select name="urgencyDegree" />}

      {!isEdit ? <Output name="recUserName" /> : <TextField name="recUserName" />}
      {!isEdit ? <Output name="recUserPhone" /> : <TelField name="recUserPhone" />}
      {!isEdit ? <Output name="reqUserPhone" /> : <TelField name="reqUserPhone" />}
      {!isEdit ? <Output name="sampleSendAddress" /> : <TextField name="sampleSendAddress" />}
      {!isEdit ? <Output name="remark" /> : <TextField name="remark" />}
    </Form>
  );
};

export default compose(formatterCollections({ code: ['sslm.sample'] }))(HeaderInfo);
