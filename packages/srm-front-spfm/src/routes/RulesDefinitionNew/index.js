/**
 * index.js 业务规则定义
 * @date: 2021-06-10
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import StoreProvider from './stores';
import RulesDefinition from './RulesDefinition';

export default (props) => (
  <StoreProvider {...props}>
    <RulesDefinition />
  </StoreProvider>
);
