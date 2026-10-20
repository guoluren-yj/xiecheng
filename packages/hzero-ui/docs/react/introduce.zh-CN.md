---
order: 0
title: HZero UI of React
---

这里是 HZero UI 的 React 实现，开发和服务于企业级后台产品。

<style>
.pic-plus > * {
  display: inline-block !important;
  vertical-align: middle;
}
.pic-plus span {
  font-size: 30px;
  color: #aaa;
  margin: 0 20px;
}
</style>

---

## 特性

- 提炼自企业级中后台产品的交互语言和视觉风格。
- 开箱即用的高质量 React 组件。
- 使用 TypeScript 构建，提供完整的类型定义文件。
- 全链路开发和设计工具体系。

## 支持环境

* 现代浏览器和 IE9 及以上（需要 [polyfills](https://ant.design/docs/react/getting-started-cn#兼容性)）。
* 支持服务端渲染。
* [Electron](http://electron.atom.io/)


## 安装

### 使用 npm 或 yarn 安装

**我们推荐使用 npm 或 yarn 的方式进行开发**，不仅可在开发环境轻松调试，也可放心地在生产环境打包部署使用，享受整个生态圈和工具链带来的诸多好处。

```bash
$ npm install hzero-ui --save
```

```bash
$ yarn add hzero-ui
```


## 示例

```jsx
import { DatePicker } from 'hzero-ui';
ReactDOM.render(<DatePicker />, mountNode);
```

引入样式：

```jsx
import 'hzero-ui/dist/hzero-ui.css';  // or 'hzero-ui/dist/hzero-ui.less'
```

### 按需加载

下面两种方式都可以只加载用到的组件。

- 使用 [babel-plugin-import](https://github.com/ant-design/babel-plugin-import)（推荐）。

   ```js
   // .babelrc or babel-loader option
   {
     "plugins": [
       ["import", { "libraryName": "hzero-ui", "libraryDirectory": "es", "style": "css" }] // `style: true` 会加载 less 文件
     ]
   }
   ```

   > 注意：webpack 1 无需设置 `libraryDirectory`。

   然后只需从 hzero-ui 引入模块即可，无需单独引入样式。等同于下面手动引入的方式。

   ```jsx
   // babel-plugin-import 会帮助你加载 JS 和 CSS
   import { DatePicker } from 'hzero-ui';
   ```

- 手动引入

   ```jsx
   import DatePicker from 'hzero-ui/lib/date-picker';  // 加载 JS
   import 'hzero-ui/lib/date-picker/style/css';        // 加载 CSS
   // import 'hzero-ui/lib/date-picker/style';         // 加载 LESS
   ```

## 链接

- [组件库](/docs/react/introduce)
- [更新日志](/changelog)


