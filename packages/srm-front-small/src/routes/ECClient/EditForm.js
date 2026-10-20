import React, { useEffect, useState } from 'react';
import { TextField, Lov, Password, Select, Form } from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';

import { fetchServerConfigService } from './api';

function EditForm(props) {
  const { recordData = {}, dataSet } = props;
  const [showAccess, setShowAccess] = useState(recordData.viewFlag);

  useEffect(() => {
    if (recordData) {
      dataSet.loadData([recordData]);
    }
  }, [recordData]);

  // 根据配置的服务地址判断展示客户id/密码
  async function handleServerAddress(serviceUrl) {
    const res = getResponse(await fetchServerConfigService({ serviceUrl }));
    setShowAccess(res);
  }

  return (
    <Form dataSet={dataSet} labelLayout="float">
      <Lov
        name="ecPlatformLov"
        onChange={(item) => {
          if (item) {
            dataSet.current.set('ecPlatformLov', {
              ecPlatform: item.ecPlatformCode,
              ecPlatformCodeName: `${item.ecPlatformCode}-${item.ecPlatformName}`,
              ecTenantId: item.tenantId,
            });
          }
          dataSet.current.set('companyLov', null);
        }}
      />
      <Lov name="companyLov" />
      <TextField name="ecCompanyName" disabled />
      <TextField name="customerCode" />
      <TextField name="userName" />
      <Password name="userPassword" />
      <TextField name="serverAddress" onChange={(value) => handleServerAddress(value)} />
      <TextField name="placeOrderUrl" />
      <TextField name="soldTo" />
      <Select name="dataType" />
      {showAccess && (
        <>
          <TextField name="accessKeyId" />
          <Password name="accessKeySecret" />
        </>
      )}
    </Form>
  );
}

export default EditForm;
