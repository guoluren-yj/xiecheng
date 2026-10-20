/*
 * @Descripttion: 
 * @version: 
 * @Author: yanglin
 * @Date: 2023-11-02 17:27:58
 * @LastEditors: yanglin
 * @LastEditTime: 2023-11-02 17:37:34
 */
import React from 'react';
import querystring from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';

import Detail from './detail';
import StoreProvider from '../stores/storeProvider';

const Index = function Index(props) {
  const params = querystring.parse(props.location.search.substr(1)) || {};
  const { budgetHeaderId, budgetTemplateId, budgetTemplateCode, budgetTemplateDesc, back } = params;

  return (
    <StoreProvider {...{ ...props, budgetHeaderId, budgetTemplateId, budgetTemplateCode, budgetTemplateDesc, back }}>
      <Detail />
    </StoreProvider>
  );
};

export default formatterCollections({
  code: ['sbdm.common', 'hzero.c7nProUI'],
})(Index);
