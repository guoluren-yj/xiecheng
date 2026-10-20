/**
 * 产品及服务
 * @date Mon Aug 13 2018
 * @author yunqiang.wu yunqiang.wu@hang-china.com
 * @version: 0.0.1
 * @copyright Copyright(c) 2018 Hand
 */
import React from 'react';
import { Tabs } from 'hzero-ui';
import intl from 'utils/intl';
import FieldTable from './FieldTable';

export default class Product extends React.PureComponent {
  state = {};

  render() {
    const {
      title = intl.get(`sslm.investTemHisOrg.view.message.tab.proservice`).d('产品及服务'),
      dataSource: { lines, investigateFlag },
      saving,
    } = this.props;
    return (
      <Tabs animated={false}>
        <Tabs.TabPane tab={title} key="product">
          <FieldTable
            col={2}
            saving={saving}
            dataSource={lines}
            investigateFlag={investigateFlag}
          />
        </Tabs.TabPane>
      </Tabs>
    );
  }
}
