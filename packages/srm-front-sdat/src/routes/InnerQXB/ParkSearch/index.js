/**
 * 园区企业
 */

import React from 'react';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import IframeComp from '../IframeComp';

const ParkSearch = () => {
  return (
    <>
      <Header title={intl.get('sdrp.innerPage.view.title.parkSearch').d('园区企业')} />
      <Content>
        <IframeComp src="/search/park-search" />
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['sdrp.innerPage'],
})(ParkSearch);
