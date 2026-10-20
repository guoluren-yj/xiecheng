/**
 * 财务状况
 * @date: 2018-8-15
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import FieldTable from './FieldTable';

export default class Finance extends React.PureComponent {
  state = {};

  /**
   * 保存修改数据
   */
  @Bind()
  onHandleAddOne(dataSource) {
    const { onHandleSave } = this.props;
    onHandleSave(dataSource);
  }

  @Bind()
  onHandleAddTwo(dataSource) {
    const { onHandleSave } = this.props;
    onHandleSave(dataSource);
  }

  /**
   * 改变是否调查当前页签
   */
  @Bind()
  onHandleChangeOne({ investigateFlag, atLeastOneFlag }) {
    const {
      dataTabOne: { lines, ...other },
      onHandleSwitchChange,
    } = this.props;
    onHandleSwitchChange({ ...other, investigateFlag, atLeastOneFlag });
  }

  @Bind()
  onHandleChangeTwo({ investigateFlag, atLeastOneFlag }) {
    const {
      dataTabTwo: { lines, ...other },
      onHandleSwitchChange,
    } = this.props;
    onHandleSwitchChange({ ...other, investigateFlag, atLeastOneFlag });
  }

  render() {
    const {
      saving,
      dataTabOne: {
        lines: dataSourceOne,
        investigateFlag: flagOne,
        atLeastOneFlag: leastFlagOne,
        gridFlag: gridFlagOne,
      },
      dataTabTwo: {
        lines: dataSourceTwo,
        investigateFlag: flagTwo,
        atLeastOneFlag: leastFlagTwo,
        gridFlag: gridFlagTwo,
      },
    } = this.props;
    return (
      <Tabs animated={false}>
        <Tabs.TabPane
          tab={intl
            .get(`spfm.investigationDefinition.view.message.tab.tab.finance`)
            .d('近三年财务状况')}
          key="finance"
        >
          <FieldTable
            col={2}
            saving={saving}
            dataSource={dataSourceOne}
            gridFlag={gridFlagOne}
            atLeastOneFlag={leastFlagOne}
            investigateFlag={flagOne}
            onHandleAdd={this.onHandleAddOne}
            onHandleChange={this.onHandleChangeOne}
          />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={intl
            .get(`spfm.investigationDefinition.view.message.tab.financeBranch`)
            .d('分支结构')}
          key="financeBranch"
        >
          <FieldTable
            col={2}
            saving={saving}
            dataSource={dataSourceTwo}
            gridFlag={gridFlagTwo}
            atLeastOneFlag={leastFlagTwo}
            investigateFlag={flagTwo}
            onHandleAdd={this.onHandleAddTwo}
            onHandleChange={this.onHandleChangeTwo}
          />
        </Tabs.TabPane>
      </Tabs>
    );
  }
}
