import React, { useEffect, useState } from 'react';
import {
  Form,
  TextField,
  NumberField,
  Switch,
  IntlField,
  Select,
  Lov,
  // CheckBox,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentUser } from 'utils/utils';

const tenantNum = getCurrentUser()?.tenantNum ?? '';

export default function RiskItemModal({ dataSet, type, viewType, dsType }) {
  const [riskType, setRiskType] = useState('');

  const handleChangeType = (value) => {
    setRiskType(value);
  };

  useEffect(() => {
    setRiskType(dsType);
  }, [dsType]);

  return (
    <>
      {type !== 2 ? (
        <Form columns={1} dataSet={dataSet} labelLayout="float">
          {type === 1 && <TextField name="parentCode" disabled />}
          {type === 1 && <TextField name="parentName" disabled />}
          <TextField name="itemCode" addonBefore={`${tenantNum}_`} disabled={viewType === 'edit'} />
          <IntlField name="itemName" />
          <NumberField name="sortNum" />
          <Switch name="endFlag" />
        </Form>
      ) : (
        <Form columns={1} dataSet={dataSet} labelLayout="float">
          <Select name="dsType" onChange={handleChangeType} disabled />
          <TextField name="itemCode" addonBefore={`${tenantNum}_`} disabled={viewType === 'edit'} />
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
          <TextField name="scriptCode" />
          <NumberField
            name="sortNum"
            help={intl
              .get('sdat.riskItemConfig.model.sortNumHelpMsg')
              .d(
                '在风险报告中，自定义的指标项会根据此处设置的顺序进行依次展示请勿重复填写，若排序号一致会导致风险报告中展示顺序错误'
              )}
          />
        </Form>
      )}
    </>
  );
}
