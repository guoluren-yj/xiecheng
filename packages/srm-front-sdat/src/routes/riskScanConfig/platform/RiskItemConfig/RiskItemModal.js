import React, { useEffect, useState } from 'react';
import { Form, TextField, NumberField, Switch, IntlField, Select, Lov } from 'choerodon-ui/pro';

export default function RiskItemModal({ dataSet, type, viewType, dsType }) {
  const [riskType, setRiskType] = useState('');

  const handleChangeType = (value) => {
    setRiskType(value);
  };

  useEffect(() => {
    setRiskType(dsType);
  }, [dsType]);

  // const loadEvent = params => {
  //   const ds = params?.dataSet ?? null;

  //   if (ds && ds.current && ds.current.get) {
  //     const detailType = ds.current.get('dsType');
  //     setRiskType(detailType);
  //   }
  // };

  return (
    <>
      {type !== 2 ? (
        <Form columns={1} dataSet={dataSet} labelLayout="float">
          {type === 1 && <TextField name="parentCode" disabled />}
          {type === 1 && <TextField name="parentName" disabled />}
          <TextField name="itemCode" disabled={viewType === 'edit'} />
          <IntlField name="itemName" />
          <NumberField name="sortNum" />
          <Switch name="endFlag" />
        </Form>
      ) : (
        <Form columns={1} dataSet={dataSet} labelLayout="float">
          <Select name="dsType" onChange={handleChangeType} />
          <TextField name="itemCode" disabled={viewType === 'edit'} />
          <IntlField name="itemName" />
          <Select name="dsMatchType" />
          {riskType === 'ITF' ? <Lov name="serviceObj" /> : null}
          {riskType === 'ITF' ? <TextField name="dsUrl" /> : null}
          {riskType === 'BIZ' ? <TextField name="dsRuleCode" /> : null}
          <NumberField name="sortNum" />
        </Form>
      )}
    </>
  );
}
