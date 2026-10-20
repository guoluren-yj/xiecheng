import React from 'react';
import { Form, CheckBox, Radio, NumberField, TextField, Select } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';

import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';

import './index.less';

const MoreSettings: React.FC<any> = ({ record, moreSettingDataDs }) => {
  return (
    <div className="contentStyle">
      <Card>
        <div className="titleTag">
          {intl.get(`scux.externalInterfaceDefinition.view.title.common.settings`).d('常用设置')}
        </div>
        <Form dataSet={moreSettingDataDs} columns={4} className="moresettingStyle">
          <CheckBox name="emptyValueFlag">
            {intl.get('scux.externalInterfaceDefinition.view.emptyValueFlag').d('空值处理')}
          </CheckBox>
          <Radio name="emptyValueMeans" value={1}>
            {intl.get('scux.externalInterfaceDefinition.view.emptyValueMeans1').d('空字符串')}
          </Radio>
          <Radio name="emptyValueMeans" value={2}>
            {intl.get('scux.externalInterfaceDefinition.view.emptyValueMeans2').d('null')}
          </Radio>
          <Radio name="emptyValueMeans" value={3}>
            {intl.get('scux.externalInterfaceDefinition.view.emptyValueMeans3').d('不传')}
          </Radio>
          <CheckBox name="requiredFlag">
            {intl.get('scux.externalInterfaceDefinition.view.requiredFlag').d('必填校验')}
          </CheckBox>
        </Form>
      </Card>
      <Card>
        <div className="titleTag">
          {intl.get(`scux.externalInterfaceDefinition.view.title.string.settings`).d('字符串设置')}
        </div>
        <Form dataSet={moreSettingDataDs} columns={4} className="moresettingStyle">
          <CheckBox name="stringLengthFlag" disabled={record.get('type') !== 'STRING'}>
            {intl.get('scux.externalInterfaceDefinition.view.stringLengthFlag').d('长度校验')}
          </CheckBox>
          <TextField
            name="stringLength"
            disabled={record.get('type') !== 'STRING'}
            suffix={intl.get('scux.externalInterfaceDefinition.view.character').d('字符')}
          />
          <Radio name="stringLengthMeans" disabled={record.get('type') !== 'STRING'} value={1}>
            {intl.get('scux.externalInterfaceDefinition.after.exceeding').d('超过后截取')}
          </Radio>
          <Radio name="stringLengthMeans" disabled={record.get('type') !== 'STRING'} value={2}>
            {intl.get('scux.externalInterfaceDefinition.after.error').d('超过后截报错')}
          </Radio>
        </Form>
      </Card>
      <Card>
        <div className="titleTag">
          {intl.get(`scux.externalInterfaceDefinition.view.title.date.settings`).d('日期设置')}
        </div>
        <Form dataSet={moreSettingDataDs} columns={4}>
          <CheckBox name="dateFormatFlag" disabled={record.get('type') !== 'DATE_TIME'}>
            {intl.get('scux.externalInterfaceDefinition.view.dateFormatMask').d('日期格式掩码')}
          </CheckBox>
          <Select name="dateFormatMeans" disabled={record.get('type') !== 'DATE_TIME'} />
        </Form>
      </Card>
      <Card>
        <div className="titleTag">
          {intl.get(`scux.externalInterfaceDefinition.view.title.number.settings`).d('数字设置')}
        </div>
        <Form dataSet={moreSettingDataDs} columns={4}>
          <CheckBox
            name="digitalAccuracyFlag"
            disabled={!['NUMBER', 'FLOAT'].includes(record.get('type'))}
          >
            {intl.get('scux.externalInterfaceDefinition.view.digitalAccuracyFlag').d('精度')}
          </CheckBox>
          <NumberField
            name="digitalAccuracyMeans"
            disabled={!['NUMBER', 'FLOAT'].includes(record.get('type'))}
          />
        </Form>
      </Card>
    </div>
  );
};

export default formatterCollections({
  code: ['scux.externalInterfaceDefinition', 'hzero.common'],
})(MoreSettings);
