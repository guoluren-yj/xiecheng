/**
 * 基本信息
 * @date: 2018-8-14
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import FieldTable from './FieldTable';

export default class Base extends React.PureComponent {
  state = {};

  /**
   * 保存修改数据
   */
  @Bind()
  onHandleAdd(dataSource) {
    const { onHandleSave } = this.props;
    onHandleSave(dataSource);
  }

  /**
   * 改变是否调查当前页签
   */
  @Bind()
  onHandleChange({ investigateFlag, atLeastOneFlag }) {
    const {
      dataSource: { lines, ...other },
      onHandleSwitchChange,
    } = this.props;
    onHandleSwitchChange({ ...other, investigateFlag, atLeastOneFlag });
  }

  render() {
    const {
      title = intl.get(`spfm.investigationDefinition.view.message.tab.basic`).d('基础信息'),
      dataSource: { lines, investigateFlag, atLeastOneFlag, gridFlag },
      saving,
    } = this.props;
    return (
      <Tabs animated={false}>
        <Tabs.TabPane tab={title} key="base">
          <FieldTable
            saving={saving}
            dataSource={lines}
            gridFlag={gridFlag}
            investigateFlag={investigateFlag}
            atLeastOneFlag={atLeastOneFlag}
            onHandleAdd={this.onHandleAdd}
            onHandleChange={this.onHandleChange}
          />
        </Tabs.TabPane>
      </Tabs>
    );
  }
}
