---
order: 3
title:
  zh-CN: 只读
  en-US: Read Only
---

## zh-CN

只读。

## en-US

Read Only.

````jsx
import { TelField, Row, Col } from 'choerodon-ui/pro';

function log(value) {
  console.log(value);
}

const regionOptions = [
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
];

ReactDOM.render(
  <Row gutter={10}>
    <Col span={12}>
      <TelField placeholder="请输入手机号" onChange={log} readOnly />
    </Col>
    <Col span={12}>
      <TelField placeholder="请输入手机号" regionOptions={regionOptions} onChange={log} valueChangeAction="input" value="15215221522" readOnly />
    </Col>
  </Row>,
  mountNode
);
````
