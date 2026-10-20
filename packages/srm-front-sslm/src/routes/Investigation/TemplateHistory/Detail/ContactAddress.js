/**
 * 联系人及地址
 * @date Mon Aug 13 2018
 * @author yunqiang.wu yunqiang.wu@hang-china.com
 * @version: 0.0.1
 * @copyright Copyright(c) 2018 Hand
 */
import React from 'react';
import { Tabs } from 'hzero-ui';
import intl from 'utils/intl';
import FieldTable from './FieldTable';

export default class ContactAddress extends React.PureComponent {
  state = {};

  render() {
    const {
      dataTabOne: { lines: dataSourceOne, investigateFlag: flagOne },
      dataTabTwo: { lines: dataSourceTwo, investigateFlag: flagTwo },
      saving,
    } = this.props;
    return (
      <Tabs animated={false}>
        <Tabs.TabPane
          tab={intl.get(`sslm.investTemHisOrg.view.message.tab.contact`).d('联系人信息')}
          key="contact"
        >
          <FieldTable
            col={2}
            saving={saving}
            dataSource={dataSourceOne}
            investigateFlag={flagOne}
          />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={intl.get(`sslm.investTemHisOrg.view.message.tab.address`).d('地址信息')}
          key="address"
        >
          <FieldTable
            col={2}
            saving={saving}
            dataSource={dataSourceTwo}
            investigateFlag={flagTwo}
          />
        </Tabs.TabPane>
      </Tabs>
    );
  }
}
