import React, { Fragment, Component } from 'react';
import { Content } from 'components/Page';
import { Tabs } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import MessageRecordManage from './MessageRecordManage';
import MessageRecordExport from './MessageRecordExport';

const { TabPane } = Tabs;
@formatterCollections({ code: ['smbl.messageRecord'] })
export default class PurchaseRobotConfig extends Component {
  render() {
    return (
      <Fragment>
        {/* <Header title={intl.get('smbl.messageRecord.view.messageRecord.title').d('消息记录')} /> */}
        <Content>
          <Tabs>
            <TabPane
              title={intl
                .get('smbl.messageRecord.view.messageRecord.pushManageTitle')
                .d('消息推送记录')}
            >
              <MessageRecordManage />
            </TabPane>
            <TabPane
              title={intl
                .get('smbl.messageRecord.view.messageRecord.exportManageTitle')
                .d('待办导出记录')}
            >
              <MessageRecordExport />
            </TabPane>
          </Tabs>
        </Content>
      </Fragment>
    );
  }
}
