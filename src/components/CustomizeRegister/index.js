/**
 * 此空组件用于在全局注册 WithCustomizeC7N 函数，通过调用 WithCustomizeC7N 函数，往全局的 CustomizeProvider 中注册 WithCustomizeC7N 函数
 * */

// eslint-disable-next-line no-unused-vars
import React from 'react';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import WithCustomizeH0 from 'srm-front-cuz/lib/h0Customize';

function App() {
  return null;
}

export default WithCustomizeH0()(WithCustomizeC7N()(App));
