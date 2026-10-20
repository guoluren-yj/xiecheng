import React, { useState, useEffect } from 'react';
import { Form, TextField, Select, Switch, Lov } from 'choerodon-ui/pro';

import intl from 'utils/intl';

export default ({ ds, functionId }) => {
  const [isTenant, setIsTenant] = useState(false);
  const [isExpression, setIsExpression] = useState(false);
  const [isLabelType, setIsLabel] = useState(false);
  useEffect(() => {
    if (functionId) {
      ds.setQueryParameter('functionId', functionId);
      ds.query().then((res) => {
        const { levelCode, functionType, isLabel } = res;
        setIsTenant(levelCode === 'TENANT');
        setIsExpression(functionType === 'EXPRESSION');
        setIsLabel(isLabel);
        // ds.getField('fieldList').setLovPara('entityCodes', entityList[0].entityCode);
        // ds.getField('labelLov').setLovPara('entityCode', entityList[0].entityCode);
      });
    }
  }, []);
  return (
    <Form labelLayout="float" columns={1} dataSet={ds}>
      <TextField name="functionCode" />
      <TextField name="functionName" />
      <Switch name="isLabel" onChange={(val) => setIsLabel(val)} />
      <Select
        name="functionType"
        onChange={(val) => {
          setIsExpression(val === 'EXPRESSION');
        }}
      />
      <Lov
        name="entityList"
        onChange={(item) => {
          if (item) {
            ds.getField('fieldList').setLovPara('entityCodes', item.entityCode);
          }
        }}
      />
      {!isLabelType ? <Lov name="fieldList" /> : <Lov name="labelLov" />}
      {isExpression && <TextField name="expression" />}
      <TextField name="remark" />
      <Select
        name="levelCode"
        onChange={(val) => {
          if (val === 'TENANT') {
            setIsTenant(true);
          } else {
            setIsTenant(false);
          }
        }}
      />
      {isTenant && (
        <Lov
          name="assignList"
          placeholder={intl.get(`spfm.functionLibrary.model.functionLibrary.tenant`).d('选择租户')}
        />
      )}
      <Switch name="enabled" />
    </Form>
  );
};
