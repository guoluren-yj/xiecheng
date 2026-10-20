/**
 * 集中排查
 */

import React from 'react';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Tabs } from 'choerodon-ui';
import IframeComp from '../IframeComp';

const { TabPane } = Tabs;

const SupplierSource = () => {
  return (
    <>
      <Header title={intl.get('sdat.innerPage.view.title.supplierSource').d('采购智能寻源')} />
      <Content>
        <Tabs defaultActiveKey="1">
          <TabPane
            tab={intl.get('sdat.innerPage.view.title.supplierSource').d('采购智能寻源')}
            key="1"
          >
            <div style={{ height: 'calc(100vh - 248px)', overflow: 'hidden' }}>
              <IframeComp src="/ent/supplier-source/question" />
            </div>
          </TabPane>
        </Tabs>
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['sdat.innerPage'],
})(SupplierSource);
