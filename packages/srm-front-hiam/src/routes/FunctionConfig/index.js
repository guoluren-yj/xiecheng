/**
 * 功能定义
 * @date: 2022-05-22
 * @author: ke.wang01 <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React from 'react';
import { ModalProvider } from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import StoreProvider from './store';
import FunctionTabs from './FunctionTabs';
import FunctionContent from './FunctionContent';

const FunctionConfig = () => {
  return (
    <>
      <Header title={intl.get('hiam.menuConfig.view.title.header.function.config').d('功能定义')} />
      <Content style={{ backgroundColor: 'initial', display: 'flex' }}>
        <FunctionTabs />
        <FunctionContent />
      </Content>
    </>
  );
};

const FunctionStoreProvider = props => {
  return (
    <StoreProvider {...props}>
      <ModalProvider>
        <FunctionConfig />
      </ModalProvider>
    </StoreProvider>
  );
};

export default formatterCollections({
  code: ['hiam.menuConfig', 'hptl.portalAssign', 'hiam.tenantMenu'],
})(FunctionStoreProvider);
