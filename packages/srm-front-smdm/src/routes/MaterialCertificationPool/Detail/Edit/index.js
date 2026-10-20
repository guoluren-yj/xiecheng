/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-14 17:30:29
 * @LastEditors: yanglin
 * @LastEditTime: 2022-10-17 21:08:46
 */
import React from 'react';
import querystring from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import Detail from './Detail';
import StoreProvider from '../storeProvider';

const Index = function Index(props) {
  const { itemAuthReqHeaderId } = props.match.params;
  const params = querystring.parse(props.location.search.substr(1)) || {};
  const { node, source } = params;

  return (
    <StoreProvider {...{ ...props, itemAuthReqHeaderId, node, readOnly: false, source }}>
      <Detail />
    </StoreProvider>
  );
};

export default formatterCollections({
  code: ['smdm.common', 'hzero.common', 'hzero.c7nProUI'],
})(
  withCustomize({
    isTemplate: true,
  })(Index)
);
