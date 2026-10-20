---
category: Components
type: Other
cols: 1
title: ConfigProvider
cover: https://gw.alipayobjects.com/zos/alicdn/kegYxl1wj/ConfigProvider.svg
---

`ConfigProvider` provides a uniform configuration support for components.

## Usage

This component provides a configuration to all React components underneath itself via the [context API](https://facebook.github.io/react/docs/context.html). In the render tree all components will have access to the provided config.

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

| locale | language package setting, you can find the packages in [antd/es/locale](http://unpkg.com/antd/es/locale/) | object |  |

## Pagenation

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| current | current page number | number | - |
| defaultCurrent | default initial page number | number | 1 |
| defaultPageSize | default number of data items per page | number | 10 |
| hideOnSinglePage | Whether to hide pager on single page | boolean | false |
| itemRender | to customize item innerHTML | (page, type: 'page' \| 'prev' \| 'next', originalElement) => React.ReactNode | - |
| pageSize | number of data items per page | number | - |
| pageSizeOptions | specify the sizeChanger options | string\[] | ['10', '20', '30', '40'] |
| showQuickJumper | determine whether you can jump to pages directly | boolean | false |
| showSizeChanger | determine whether `pageSize` can be changed | boolean | false |
| showTotal | to display the total number and range | Function(total, range) | - |
| simple | whether to use simple mode | boolean | - |
| size | specify the size of `Pagination`, can be set to `small` | string | "" |
| total | total number of data items | number | 0 |
| onChange | a callback function, executed when the page number is changed, and it takes the resulting page number and pageSize as its arguments | Function(page, pageSize) | noop |
| onShowSizeChange | a callback function, executed when `pageSize` is changed | Function(current, size) | noop |

## Exported

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| disabled | disabled state of button | boolean | `false` |
| ghost | make background transparent and invert text and border colors, added in 2.7 | boolean | false |
| href | redirect url of link button | string | - |
| htmlType | set the original html `type` of `button`, see: [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type) | string | `button` |
| icon | set the icon of button, see: Icon component | string | - |
| loading | set the loading status of button | boolean \| { delay: number } | false |
| shape | can be set to `circle` or omitted | string | - |
| size | can be set to `small` `large` or omitted | string | `default` |
| target | same as target attribute of a, works when href is specified | string | - |
| type | can be set to `primary` `ghost` `dashed` `danger`(added in 2.7) or omitted (meaning `default`) | string | `default` |
| onClick | `click` exported envent | function({dataParam,method,action}) | - |
| dataParam | export params | {} | - |
| method | export method | `get | set ` | - |
| action | the export url  | string | - |


## FAQ

#### How to contribute a new language?

See [<Adding new language>](/docs/react/i18n#Adding-newplanguage).

#### Does the locale problem still exist in DatePicker even if ConfigProvider `locale` is used?

Please make sure you set moment locale or that you don't have two different versions of moment.

```js
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
```

