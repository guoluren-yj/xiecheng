/**
 * 舆情监控
 */

import React from 'react';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import IframeComp from '../IframeComp';

const NewsMonitor = () => {
  return (
    <>
      <Header title={intl.get('sdrp.innerPage.view.title.newsMonitor').d('舆情监控')} />
      <Content>
        <IframeComp src="/monitor/news-monitor" />
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['sdrp.innerPage'],
})(NewsMonitor);
