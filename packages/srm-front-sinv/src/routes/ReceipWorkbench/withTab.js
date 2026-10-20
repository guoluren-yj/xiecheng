// 改造自定义C7nPopover
import React from 'react';
import { Tabs } from 'choerodon-ui';

import intl from 'utils/intl';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';

import ThingReceipts from './ThingReceipts/index';
import ThingEndReceipts from './ThingReceipts/endIndex';
import ThingCourseReceipts from './ThingReceipts/courseIndex';
import ReturnableReceipts from './ThingReceipts/returnIndex';
import WaitConfirm from './ThingReceipts/waitConfirm';

const { TabPane } = Tabs;

const TabShow = (props) => {
  const {
    tabClause,
    tabCutPage,
    listProps,
    customizeTabPane,
    changeTab = (e) => e,
    tabSelectChange = (e) => e,
  } = props;
  return (
    <div>
      {customizeTabPane(
        {
          code: 'SINV.RECEIPT_WORKBENCH_THING.TAB',
          custDefaultActive: (key) => {
            changeTab(key);
          },
        },
        <Tabs
          onChange={(tabKey) => tabSelectChange(tabKey)}
          defaultActiveKey="one"
          activeKey={tabCutPage || 'one'}
        >
          <TabPane
            tab={
              <span>{intl.get('sinv.receiptExecution.model.receipt.waitCount').d('待收货')}</span>
            }
            count={tabClause.waitingCount}
            key="one"
          >
            <ThingReceipts {...listProps} />
          </TabPane>
          <TabPane
            tab={
              <span>
                {intl.get('sinv.receiptExecution.model.receipt.returnsCounts').d('可退货')}
              </span>
            }
            count={tabClause.reverseCount}
            key="four"
          >
            <ReturnableReceipts {...listProps} />
          </TabPane>
          <TabPane
            tab={
              <span>
                {intl.get('sinv.receiptExecution.model.receipt.executeCount').d('执行中')}
              </span>
            }
            count={tabClause.doingCount}
            key="two"
          >
            <ThingCourseReceipts {...listProps} />
          </TabPane>
          <TabPane
            tab={
              <span>{intl.get('sinv.receiptExecution.model.receipt.waitConfirm').d('待确认')}</span>
            }
            count={tabClause.confirmCount}
            key="five"
          >
            <WaitConfirm {...listProps} />
          </TabPane>
          <TabPane
            tab={<span>{intl.get('sinv.receiptExecution.model.receipt.okCount').d('已完成')}</span>}
            count={tabClause.finishedCount}
            key="three"
          >
            <ThingEndReceipts {...listProps} />
          </TabPane>
        </Tabs>
      )}
    </div>
  );
};

export default WithCustomize({ unitCode: ['SINV.RECEIPT_WORKBENCH_THING.TAB'] })(TabShow);
