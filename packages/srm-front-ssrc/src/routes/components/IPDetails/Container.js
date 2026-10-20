import React, { useState, useCallback } from 'react';
import { Tabs } from 'choerodon-ui';
import { noop } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';

import OverlappingSupplier from './OverlappingSupplier';
import NoOverlappingSupplier from './NoOverlappingSupplier';

const { TabPane } = Tabs;

const Container = (props) => {
  const { rfxHeaderId, customizeTabPane = noop } = props || {};
  const [activeKey, setActiveKey] = useState('overlappingSupplier');

  const handleChangeTab = useCallback(
    (tabKey) => {
      setActiveKey(tabKey);
    },
    [activeKey, setActiveKey]
  );

  return customizeTabPane(
    {
      code: 'SSRC.INQUIRY_HALL_DETAIL.IP_QUERY_DETAILS',
    },
    <Tabs defaultActiveKey={activeKey} activeKey={activeKey} onChange={handleChangeTab}>
      <TabPane
        key="overlappingSupplier"
        tab={intl.get('ssrc.common.view.title.overlappingSupplier').d('重合供应商信息')}
      >
        <OverlappingSupplier rfxHeaderId={rfxHeaderId} />
      </TabPane>

      <TabPane
        key="noOverlappingSupplier"
        tab={intl.get('ssrc.common.view.title.noOverlappingSupplier').d('无重合供应商信息')}
      >
        <NoOverlappingSupplier rfxHeaderId={rfxHeaderId} />
      </TabPane>
    </Tabs>
  );
};

export default withCustomize({
  unitCode: ['SSRC.INQUIRY_HALL_DETAIL.IP_QUERY_DETAILS'],
})(
  formatterCollections({
    code: ['ssrc.inquiryHall', 'ssrc.common'],
  })(Container)
);
