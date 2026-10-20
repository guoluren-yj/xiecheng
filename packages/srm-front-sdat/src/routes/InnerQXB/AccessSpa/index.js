/**
 * 资质筛选
 */

import React from 'react';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import IframeComp from '../IframeComp';

const AccessSpa = () => {
  return (
    <>
      <Header title={intl.get('sdrp.innerPage.view.title.accessSpa').d('资质筛选')} />
      <Content>
        <IframeComp src="/access-spa/index" />
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['sdrp.innerPage'],
})(AccessSpa);
