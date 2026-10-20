/**
 * 客商搜索
 */
import React from 'react';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import IframeComp from '../IframeComp';

const Advanced = () => {
  return (
    <>
      <Header title={intl.get('sdrp.innerPage.view.title.advanced').d('客商搜索')} />
      <Content>
        <IframeComp src="/search/advanced" />
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['sdrp.innerPage'],
})(Advanced);
