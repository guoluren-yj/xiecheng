---
category: Pro Components
subtitle: 电话输入框
type: Data Entry
title: TelField
---

电话输入框。

## 何时使用

需要输入电话的时候使用。

## API

### TelField

| 参数 | 说明   | 类型   | 默认值 |
| ---- | ------ | ------ | ------ |
| regionOptions | 区号下拉列表 | RegionOption[] | |
| regionField | 区号字段，绑定DataSet时填写对应字段的FieldName | string | |
| onRegionChange | 切换区号 | (value: RegionOption) => void | |


### RegionOption

| 参数 | 说明   | 类型   | 默认值 |
| ---- | ------ | ------ | ------ |
| regionCode | 区号编码 | string | |
| regionName | 区号名称 | string | |
| pattern | 正则 | string \| RegExp | |

更多属性请参考 [TextField](/components-pro/text-field/#TextField)。

