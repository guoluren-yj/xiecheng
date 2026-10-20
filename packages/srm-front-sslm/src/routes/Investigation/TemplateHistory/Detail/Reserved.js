/*
 * @Date: 2022-02-18 10:51:26
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Tabs } from 'hzero-ui';
import FieldTable from './FieldTable';

export default class Reserved extends React.PureComponent {
  state = {};

  render() {
    const {
      dataSource: { configDescription, configName, lines, investigateFlag },
      saving,
    } = this.props;
    return (
      <Tabs animated={false}>
        <Tabs.TabPane tab={configDescription} key={configName}>
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
