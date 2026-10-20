/* eslint-disable no-unused-vars */
import React, { useContext, useState, memo } from 'react';
import { Tabs } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import LogisticsDetail from '@/routes/components/C7nFormLogistic';

import BaseInfo from './BaseInfo';
import OtherInfo from './OtherInfo';
import BaseLogisticInfo from './BaseLogisticInfo';
import { Store } from './index';

const { TabPane } = Tabs;

function ShipFooterInfo() {
  const { customizeForm, customizeTabPane, LogisticsDs, editFlag } = useContext(Store);
  const [_, setUpdate] = useState({});
  const logisticsDetailProps = {
    customizeForm,
    headerInfo: LogisticsDs.map((i) => i.toData())[0],
  };

  return (
    <div style={{ marginBottom: 8 }} id="supplier-delivery-basicInfo">
      {customizeTabPane(
        {
          code: 'SINV.SUPPLIER_DELIVERY.DETAIL.LINE_TABS',
        },
        <Tabs animated={false} onChange={() => setUpdate()}>
          <TabPane
            tab={intl.get(`sinv.common.view.message.title.basicInfo`).d('基本信息')}
            key="basicInfo"
          >
            <BaseInfo />
          </TabPane>
          <TabPane
            tab={intl.get(`sinv.common.view.message.title.otherInfo`).d('其它信息')}
            key="otherInfo"
          >
            <OtherInfo />
          </TabPane>
          <TabPane
            tab={intl.get(`sinv.common.view.message.title.logistics`).d('物流信息')}
            key="logistics"
          >
            <BaseLogisticInfo />
            <LogisticsDetail {...logisticsDetailProps} />
          </TabPane>
        </Tabs>
      )}
    </div>
  );
}

export default memo(ShipFooterInfo);
