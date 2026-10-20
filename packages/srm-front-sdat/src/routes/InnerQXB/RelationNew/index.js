/**
 * 集中排查
 */

import React from 'react';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import IframeComp from '../IframeComp';

const RelationNew = () => {
  return (
    <>
      <Header title={intl.get('sdrp.innerPage.view.title.relationNew').d('集中排查')} />
      <Content>
        <IframeComp src="/relation/get-relation-new/focus" />
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['sdrp.innerPage'],
})(RelationNew);
