/**
 * 批量排查
 */

import React from 'react';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import IframeComp from '../IframeComp';

const BatchInvestigation = () => {
  return (
    <>
      <Header title={intl.get('sdrp.innerPage.view.title.batchInvest').d('批量排查')} />
      <Content>
        <IframeComp src="/investigation/batch" />
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['sdrp.innerPage'],
})(BatchInvestigation);
