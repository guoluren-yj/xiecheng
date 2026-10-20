import React from 'react';
import { Form, Switch, TextArea, SelectBox, Lov } from 'choerodon-ui/pro';

import intl from 'utils/intl';

const { Option } = SelectBox;

export default function (props) {
  const { dataSet } = props;

  // 设置方式
  const selectTypeList = [
    {
      value: 3,
      meaning: intl.get('smpc.product.model.bool').d('布尔值'),
    },
    {
      value: 1,
      meaning: intl.get('smpc.product.model.radio').d('单选'),
    },
    {
      value: 0,
      meaning: intl.get('smpc.product.model.checkbox').d('多选'),
    },
    {
      value: 2,
      meaning: intl.get('smpc.product.model.text').d('文本'),
    },
  ];
  // 自定义属性值
  const valueCustom = [
    {
      value: 1,
      meaning: intl.get('smpc.product.model.support').d('支持'),
    },
    {
      value: 0,
      meaning: intl.get('smpc.product.model.unSupport').d('不支持'),
    },
  ];

  return (
    <div className="category-attr-modal">
      <Form dataSet={dataSet} labelLayout="float" columns={1}>
        <Lov name="attrLov" />
      </Form>
      <Form dataSet={dataSet} columns={1} labelAlign="left" labelWidth={95}>
        <SelectBox
          name="operationType"
          onChange={(value) => {
            // 为文本(2)时,自定义属性值锁定为支持;为布尔值(3)时,自定义属性值锁定为不支持
            if (value === 2) dataSet.records[0].set('valueCustom', 1);
            else if (value === 3) dataSet.records[0].set('valueCustom', 0);
          }}
        >
          {selectTypeList.map((item) => (
            <Option value={item.value}>{item.meaning}</Option>
          ))}
        </SelectBox>
        <SelectBox name="valueCustom" required>
          {valueCustom.map((item) => (
            <Option value={item.value}>{item.meaning}</Option>
          ))}
        </SelectBox>
      </Form>
      <Form dataSet={dataSet} labelLayout="float" columns={1}>
        <TextArea rowSpan={2} colSpan={2} name="fillInFormat" />
      </Form>
      <Form dataSet={dataSet} columns={1} labelAlign="left" labelWidth={95}>
        <Switch name="requiredFlag" />
        <Switch name="enabledFlag" />
      </Form>
    </div>
  );
}
