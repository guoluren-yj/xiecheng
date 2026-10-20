---
order: 2
title:
  zh-CN: 数据源
  en-US: DataSet
---

## zh-CN

绑定数据源。

## en-US

DataSet binding.

````jsx
import { DataSet, TelField } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset newValue]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

class App extends React.Component {
  options = new DataSet({
    fields: [
      { name: 'regionCode', type: 'string' },
      { name: 'pattern', type: 'string' },
      { name: 'regionName', type: 'string' },
    ],
    data: [
      {
        regionCode: '+86',
        pattern: /^1[3-9]\d{9}$/,
        regionName: '中国大陆',
      },
      {
        regionCode: '+886',
        pattern: /^1[3-9]\d{9}$/,
        regionName: '中国台湾',
      },
      {
        regionCode: '+852',
        pattern: /^1[3-9]\d{9}$/,
        regionName: '中国香港',
      }
    ],
  });

  ds = new DataSet({
    fields: [
      { name: 'phone', type: 'tel', pattern: /^1[3-9]\d{9}$/, regionField: 'region', label: '请输入手机号' },
      { name: 'region', type: 'string', options: this.options, valueField: 'regionCode', textField: 'regionName' },
    ],
    events: {
      update: handleDataSetChange,
    },
    data: [{
      region: '+886',
    }]
  });

  render() {
    return <TelField dataSet={this.ds} name="phone" />;
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
