---
order: 0
title:
  zh-CN: 基本
  en-US: Basic
---

## zh-CN

最简单的用法。

## en-US

The most basic usage.

````jsx
import { Switch } from 'hzero-ui';

function onChange(checked) {
  console.log(`switch to ${checked}`);
}

ReactDOM.render(
  <div>
    <Switch defaultChecked onChange={onChange} checkedChildren="true" unCheckedChildren="false"/>
    <br/>
    <Switch defaultChecked onChange={onChange} checkedChildren="Y" unCheckedChildren="N" checkedValue='Y' unCheckedValue='N'/>
  </div>,
  
  mountNode
);
````

<style>
.ant-switch {
  margin-bottom: 8px;
}
</style>
