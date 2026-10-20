---
order: 0
title:
    zh-CN: 基本
    en-US: Basic
---

## zh-CN

数字输入框。

## en-US

Numeric-only input box.

````jsx
import { InputNumber } from 'hzero-ui';

function onChange(value) {
  console.log('changed', value);
}

ReactDOM.render(
  <div>
    <InputNumber min={1} max={10}  defaultValue={3} onChange={onChange} />
    <InputNumber allowThousandth  precision={5}  style={{width:'200px'}}/>
  </div>,
  mountNode);
````
