import React from 'react';
import querystring from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';

import Detail from './Detail';
import StoreProvider from '../storeProvider';

const Index = function Index(props) {
  const { budgetItemId } = props.match.params;
  const params = querystring.parse(props.location.search.substr(1)) || {};
  const { cacheKey } = params;

  return (
    <StoreProvider {...{ ...props, budgetItemId, readOnly: true, cacheKey }}>
      <Detail />
    </StoreProvider>
  );
};

export default formatterCollections({
  code: ['sbdm.common', 'hzero.common', 'hzero.c7nProUI'],
})(Index);
