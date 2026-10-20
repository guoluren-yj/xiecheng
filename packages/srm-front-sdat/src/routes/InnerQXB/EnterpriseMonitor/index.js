/**
 * 企业监控
 */

import React from 'react';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import IframeComp from '../IframeComp';

const EnterpriseMonitor = () => {
  return (
    <>
      <Header title={intl.get('sdrp.innerPage.view.title.enterpriseMonitor').d('企业监控')} />
      <Content>
        <IframeComp src="/monitor/enterprise-monitor/overview" />
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['sdrp.innerPage'],
})(EnterpriseMonitor);
