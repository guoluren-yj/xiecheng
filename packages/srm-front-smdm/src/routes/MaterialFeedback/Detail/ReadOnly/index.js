/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-14 17:30:29
 * @LastEditors: yanglin
 * @LastEditTime: 2023-06-30 17:47:08
 */
import React from 'react';
import querystring from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import Detail from './Detail';
import StoreProvider from '../storeProvider';

const Index = function Index(props) {
  const {
    match: { path = '' },
    location,
    onLoad,
    onFormLoaded,
  } = props;
  const { itemAuthFeeHeaderId } = props.match.params;
  const params = querystring.parse(location.search.substr(1)) || {};
  const { node, source, cuxDom } = params;

  const isPrequalification = path.includes('/smdm/material-certification-pool/prequalification/');

  const pubPathFlag = path.includes('/pub/smdm/material-certification-feedback/read');

  return (
    <StoreProvider
      {...{
        ...props,
        itemAuthFeeHeaderId,
        node,
        readOnly: true,
        pubPathFlag,
        isPrequalification,
        source,
        cuxDom,
      }}
    >
      <Detail onLoad={onLoad} onFormLoaded={onFormLoaded} />
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
