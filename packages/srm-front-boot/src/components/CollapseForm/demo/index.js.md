```js
// index.js
import React, { PureComponent } from 'react';
import { Select, Lov, Switch, DataSet } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import CollapseForm from "@/components/CollapseForm/index.tsx";
import styles from './index.less';

const { Option } = Select;
const ds = new DataSet({
  data: [{
    quotationType: "o",
    currencyType: "o",
    quotationRange: { value: 'test', meaning: '部份报价' },
  }],
  fields: [
    { name: 'quotationType', label: "报价方式", required: true },
    { name: 'quotationRange', label: "报价范围", required: true, type: "object", lovCode: "SMDM.ITEM" },
  ],
  events: {
    update: ({ value }) => { console.log(value); },
  },
});
const fieldChildren = [
  <Select name="quotationType" label="报价方式">
    <Option value="o">线上报价</Option>
    <Option value="f">线下</Option>
  </Select>,
  <Lov name="quotationRange" triggerMode='input' label="报价范围" />,
  <Select name="currencyType" label="币种">
    <Option value="o">CNY</Option>
    <Option value="f">US</Option>
  </Select>,
  <Switch name="allowMultiCurrency" label="允许多币种报价" checkedValue={1} unCheckedValue={0} />,
  <Select name="quotationType1" label="报价方式">
    <Option value="o">线上报价</Option>
    <Option value="f">线下</Option>
  </Select>,
  <Lov name="quotationRange1" triggerMode='input' label="报价范围" />,
  <Select name="currencyType1" label="币种">
    <Option value="o">CNY</Option>
    <Option value="f">US</Option>
  </Select>,
  <Switch name="allowMultiCurrency1" label="允许多币种报价" checkedValue={1} unCheckedValue={0} />,
  <Select name="quotationType2" label="报价方式">
    <Option value="o">线上报价</Option>
    <Option value="f">线下</Option>
  </Select>,
  <Lov name="quotationRange2" triggerMode='input' label="报价范围" />,
  <Select name="currencyType2" label="币种">
    <Option value="o">CNY</Option>
    <Option value="f">US</Option>
  </Select>,
  <Switch name="allowMultiCurrency2" label="允许多币种报价" checkedValue={1} unCheckedValue={0} />,
];
export default class Demo extends PureComponent {

  getData = () => {
    console.log(ds.toData());
  }

  render() {
    return (
      <>
        <Header title="test"><a onClick={this.getData}>查看ds数据</a></Header>
        <Content style={{ paddingRight: "33%" }}>
          <div className={styles.title}>对供应商要求</div>
          <CollapseForm dataSet={ds}>
            {fieldChildren}
          </CollapseForm>
        </Content>
      </>
    );
  }
}
```

```less
// index.less
.title {
  margin-bottom: 8px;

  &::before {
    content         : '';
    display         : inline-block;
    height          : 3px;
    width           : 8px;
    margin-right    : 4px;
    background-color: #23b1ef;
  }
}
```