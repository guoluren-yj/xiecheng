/*
 * 附件信息
 * @date: 2018/08/07 15:12:06
 * @author: yunqiang.wu yunqiang.wu@hang-china.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Tabs, Form } from 'hzero-ui';
import intl from 'utils/intl';
import FieldTable from './FieldTable';
import AttachmentTempDefine from './AttachmentTempDefine';

@Form.create({ fieldNameProp: null })
export default class Attachment extends React.PureComponent {
  state = {};

  render() {
    const {
      saving,
      title = intl.get(`sslm.investTemHisOrg.view.message.tab.attachment`).d('附件信息'),
      dataSource: { lines, investigateFlag },
      templateProp: { attachmentList = [] },
    } = this.props;
    return (
      <Tabs animated={false}>
        <Tabs.TabPane tab={title} key="attachment">
          <FieldTable
            col={2}
            saving={saving}
            dataSource={lines}
            investigateFlag={investigateFlag}
          />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={intl
            .get(`sslm.investTemHisOrg.view.message.tab.attachmentTempDefine`)
            .d('附件模板定义')}
          key="attachmentTempDefine"
        >
          <AttachmentTempDefine dataSource={attachmentList} />
        </Tabs.TabPane>
      </Tabs>
    );
  }
}
