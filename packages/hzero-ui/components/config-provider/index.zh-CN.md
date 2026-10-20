---
category: Components
subtitle: 全局化配置
cols: 1
type: 其他
title: ConfigProvider
cover: https://gw.alipayobjects.com/zos/alicdn/kegYxl1wj/ConfigProvider.svg
---

为组件提供统一的全局化配置。

## 使用

ConfigProvider 使用 React 的 [context](https://facebook.github.io/react/docs/context.html) 特性，只需在应用外围包裹一次即可全局生效。

```jsx
import { ConfigProvider } from 'antd';

// ...

return (
  <ConfigProvider {...yourConfig}>
    <App />
  </ConfigProvider>
);
```

## API

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| locale | 语言包配置，语言包可到 [antd/es/locale](http://unpkg.com/antd/es/locale/) 目录下寻找 | object | - |  |
| pagination | 设置全局的pagination配置参考下面 | obj | {} | 1.0.77 |
| expored | 设置全局的pagination配置参考下面 | obj | {} | 1.0.77 |

## Pagination

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| current | 当前页数 | number | - |
| defaultCurrent | 默认的当前页数 | number | 1 |
| defaultPageSize | 默认的每页条数 | number | 10 |
| hideOnSinglePage | 只有一页时是否隐藏分页器 | boolean | false |
| itemRender | 用于自定义页码的结构，可用于优化 SEO | (page, type: 'page' \| 'prev' \| 'next', originalElement) => React.ReactNode | - |
| pageSize | 每页条数 | number | - |
| pageSizeOptions | 指定每页可以显示多少条 | string\[] | ['10', '20', '30', '40'] |
| showQuickJumper | 是否可以快速跳转至某页 | boolean | false |
| showSizeChanger | 是否可以改变 pageSize | boolean | false |
| showTotal | 用于显示数据总量和当前数据顺序 | Function(total, range) | - |
| simple | 当添加该属性时，显示为简单分页 | boolean | - |
| size | 当为「small」时，是小尺寸分页 | string | "" |
| total | 数据总数 | number | 0 |
| onChange | 页码改变的回调，参数是改变后的页码及每页条数 | Function(page, pageSize) | noop |
| onShowSizeChange | pageSize 变化的回调 | Function(current, size) | noop |

## Exported

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| disabled | 按钮失效状态 | boolean | `false` |
| ghost | 幽灵属性，使按钮背景透明，版本 2.7 中增加 | boolean | false |
| href | 点击跳转的地址，指定此属性 button 的行为和 a 链接一致 | string | - |
| htmlType | 设置 `button` 原生的 `type` 值，可选值请参考 [HTML 标准](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type) | string | `button` |
| icon | 设置按钮的图标类型 | string | - |
| loading | 设置按钮载入状态 | boolean \| { delay: number } | `false` |
| shape | 设置按钮形状，可选值为 `circle` 或者不设 | string | - |
| size | 设置按钮大小，可选值为 `small` `large` 或者不设 | string | `default` |
| target | 相当于 a 链接的 target 属性，href 存在时生效 | string | - |
| type | 设置按钮类型，可选值为 `primary` `dashed` `danger`(版本 2.7 中增加) 或者不设 | string | - |
| onClick | `click` 导出事件 | function({dataParam,method,action}) | - |
| dataParam | 导出的参数 | {} | - |
| method | 导出的方法 | `get | set ` | - |
| action | 对应的url链接 | string | - |



## FAQ

#### 如何增加一个新的语言包？
   
参考[《增加语言包》](/docs/react/i18n#%E5%A2%9E%E5%8A%A0%E8%AF%AD%E8%A8%80%E5%8C%85)。

#### 为什么我使用了 ConfigProvider `locale`，时间类组件的国际化还有问题？

请检查是否正确设置了 moment 语言包，或者是否有两个版本的 moment 共存。

```js
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
```