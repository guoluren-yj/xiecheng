import React from 'react';
import querystring from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';

import Detail from './detail';
import StoreProvider from '../stores/storeProvider';

const Index = function Index(props) {
  const {
    match: { path = '' },
    location,
  } = props;

  const params = querystring.parse(location.search.substr(1)) || {};
  const { budgetHeaderId, budgetTemplateCode, status } = params;
  const pubPathFlag = path.includes('/pub/sbud/budget/read');

  return (
    <StoreProvider
      {...{ ...props, budgetHeaderId, budgetTemplateCode, status, pubPathFlag, readOnly: true }}
    >
      <Detail />
    </StoreProvider>
  );
};

export default formatterCollections({
  code: ['sbdm.common', 'hzero.c7nProUI'],
})(Index);
