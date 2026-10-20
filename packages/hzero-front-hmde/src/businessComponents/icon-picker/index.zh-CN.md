---
category: Pro Components
subtitle: 图标选择框
type: Data Entry
title: IconPicker
---

自定义图标选择框。

## 何时使用

当用户需要输入一个图标，可以点击标准输入框，弹出图标面板进行选择。

## API

### IconPicker

图标选择框

| 参数      | 说明                                     | 类型        |默认值 |
|-----------|------------------------------------------|------------|--------|
| onChange | 选择图标的回调 | (item: object) => {}  |  |
| onItemEnter | 鼠标移入图标事件回调 | () => {} |  |
| onItemLeave | 鼠标移出图标事件回调 | () => {} |  |
| dataSource | 配置需要的下拉列表数据源 | { [key: string]: string[]; } \| string[]|  |  |

```
// 示例代码
 <IconPicker dataSource={dataSource} onChange={onChange} />
```

更多属性努力开发中。

