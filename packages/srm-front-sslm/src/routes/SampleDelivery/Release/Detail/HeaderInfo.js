import { compose } from 'lodash';
import React from 'react';
import { Form, TextField, Lov, Select, Output, CheckBox, TelField } from 'choerodon-ui/pro';

import formatterCollections from 'utils/intl/formatterCollections';
import { yesOrNoRender } from 'utils/renderer';
import '@/routes/index.less';

const HeaderInfo = ({
  formDs,
  isDisable,
  proxyDsCreate,
  customizeForm,
  custLoading,
  isEdit = false,
}) => {
  return customizeForm(
    {
      code: 'SSLM.SAMPLE_DELIVERY_PUBLISH.BASIC_INFO',
      readOnly: isDisable,
      enableCreate: false,
      proxyDsCreate,
      __force_record_to_update__: true,
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
      <Output name="creationDate" />
      {isDisable ? <Output name="companyId" /> : <Lov name="companyId" />}
      {isDisable ? <Output name="ouId" /> : <Lov name="ouId" />}
      {isDisable ? <Output name="invOrganizationId" /> : <Lov name="invOrganizationId" />}
      {isDisable ? <Output name="supplierId" /> : <Lov name="supplierId" />}
      {isDisable ? <Output name="supplierTypeCode" /> : <Select name="supplierTypeCode" />}
      {isDisable ? <Output name="originFactoryName" /> : <TextField name="originFactoryName" />}
      {isDisable ? <Output name="typeCode" /> : <Select name="typeCode" />}
      {isDisable ? <Output name="urgencyDegree" /> : <Select name="urgencyDegree" />}
      {isDisable ? <Output name="sampleSendAddress" /> : <TextField name="sampleSendAddress" />}
      {isDisable ? <Output name="recUserName" /> : <TextField name="recUserName" />}
      {isDisable ? <Output name="recUserIdLov" /> : <Lov name="recUserIdLov" />}
      {isDisable ? <Output name="recUserPhone" /> : <TelField name="recUserPhone" />}
      {isDisable ? <Output name="reqUserPhone" /> : <TelField name="reqUserPhone" />}
      {isDisable ? <Output name="receiveUnitId" /> : <Lov name="receiveUnitId" />}
      {isEdit ? (
        <CheckBox name="needFeedbackFlag" />
      ) : (
        <Output name="needFeedbackFlag" renderer={({ value }) => yesOrNoRender(value)} />
      )}
      {isEdit ? (
        <CheckBox name="confirmationFlag" />
      ) : (
        <Output name="confirmationFlag" renderer={({ value }) => yesOrNoRender(value)} />
      )}
      <Output name="documentSource" />
      {isDisable ? <Output name="remark" /> : <TextField name="remark" />}
    </Form>
  );
};

export default compose(formatterCollections({ code: ['sslm.sample'] }))(HeaderInfo);
