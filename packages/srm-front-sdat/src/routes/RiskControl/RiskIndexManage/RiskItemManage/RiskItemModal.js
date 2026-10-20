import React, { useEffect, useState } from 'react';
import {
  Form,
  TextField,
  NumberField,
  Switch,
  IntlField,
  Select,
  Lov,
  CheckBox,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';

export default function RiskItemModal({ dataSet, type, viewType, dsType }) {
  const [riskType, setRiskType] = useState('');
  const [flagValue, setFlagValue] = useState('0');

  const standardFlag = dataSet?.current?.get('standardFlag') ?? '';

  useEffect(() => {
    setFlagValue(standardFlag);
  }, [standardFlag]);

  const handleChangeType = value => {
    setRiskType(value);
  };

  useEffect(() => {
    setRiskType(dsType);
  }, [dsType]);

  const handleChangeFlag = value => {
    setFlagValue(value);
  };

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
          {riskType === 'ITF' ? (
            <Lov
              name="serviceObj"
              help={intl.get('sdat.riskItemConfig.model.serviceHelp').d('调用的服务编码')}
            />
          ) : null}
          {riskType === 'ITF' ? (
            <TextField
              name="dsUrl"
              help={intl
                .get('sdat.riskItemConfig.model.interfaceAddressHelp')
                .d('调用对应服务的接口地址')}
            />
          ) : null}
          {riskType === 'BIZ' ? (
            <TextField
              name="dsRuleCode"
              help={intl.get('sdat.riskItemConfig.model.ruleCodeHelp').d('大数据侧定义的指标编码')}
            />
          ) : null}
          <Select name="applyScope" />
          <CheckBox name="standardFlag" onChange={handleChangeFlag} />
          {flagValue === '0' ? <Lov name="tenantList" /> : null}
          <NumberField name="sortNum" />
        </Form>
      )}
    </>
  );
}
