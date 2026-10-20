import React from 'react';
import { Tabs } from 'hzero-ui';

import intl from 'utils/intl';

import ExtensionHeaderTable from './ExtensionOrderHeader';
import ExtensionLineTable from './ExtensionLineTable';

export default class ExtensionTab extends React.PureComponent {
  render() {
    const {
      extensionHeaderData = {},
      extensionData = {},
      loading,
      handleToDetail,
      handleOpenModal,
      handleChangeKey,
      activeKey,
      handleCheckMethod,
    } = this.props;
    return (
      <React.Fragment>
        <Tabs activeKey={activeKey} onChange={(key) => handleChangeKey(key)}>
          <Tabs.TabPane tab={intl.get('smodr.orderLine.model.orderHeader').d('订单头信息')} key="1">
            <ExtensionHeaderTable
              loading={loading}
              handleToDetail={handleToDetail}
              handleOpenModal={handleOpenModal}
              extensionHeaderData={extensionHeaderData}
            />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={intl.get('smodr.frightLine.model.freightLineInfo').d('运费行信息')}
            key="2"
          >
            <ExtensionLineTable
              extensionData={extensionData}
              loading={loading}
              handleToDetail={handleToDetail}
              handleOpenModal={handleOpenModal}
              handleCheckMethod={handleCheckMethod}
            />
          </Tabs.TabPane>
        </Tabs>
      </React.Fragment>
    );
  }
}
