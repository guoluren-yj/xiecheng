---
order: 0
title:
    zh-CN: 基本使用
    en-US: Basic usage
---

## zh-CN

基本使用。

## en-US

Basic usage example.

````jsx
import { Input } from 'hzero-ui';

ReactDOM.render(
  <div>
    <div className="example-input">
      <Input placeholder="Basic usage" />
      <Input placeholder="大写" typeCase="upper" />
      <Input placeholder="小写" typeCase="lower" />
      <Input placeholder="关闭全角半角转换" dbc2sbc={false} />
      <Input placeholder="去掉前后空格" trim />
      <Input placeholder="去掉所有空格" trimAll />
      <Input placeholder="禁止中文字符" inputChinese={false} />
    </div>
    <Input type="password" style={{ width: 200 }} />
  </div>,
mountNode);
````
