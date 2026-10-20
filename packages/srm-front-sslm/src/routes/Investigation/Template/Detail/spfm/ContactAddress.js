/**
 * 联系人及地址
 * @date: 2018-8-15
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import FieldTable from './FieldTable';

@formatterCollections({
  code: ['spfm.investigationDefinition'],
})
export default class ContactAddress extends React.PureComponent {
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
  onHandleChangeOne({ investigateFlag, atLeastOneFlag, contactRequiredCount }) {
    const {
      dataTabOne: { lines, ...other },
      onHandleSwitchChange,
    } = this.props;
    onHandleSwitchChange({ ...other, investigateFlag, atLeastOneFlag, contactRequiredCount });
  }

  @Bind()
  onHandleChangeTwo({ investigateFlag, atLeastOneFlag, requiredCount }) {
    const {
      dataTabTwo: { lines, ...other },
      onHandleSwitchChange,
    } = this.props;
    onHandleSwitchChange({ ...other, investigateFlag, atLeastOneFlag, requiredCount });
  }

  render() {
    const {
      dataTabOne: {
        lines: dataSourceOne,
        investigateFlag: flagOne,
        atLeastOneFlag: leastFlagOne,
        gridFlag: gridFlagOne,
        configName: configNameOne,
        contactRequiredCount,
        ...rest1
      },
      dataTabTwo: {
        lines: dataSourceTwo,
        investigateFlag: flagTwo,
        atLeastOneFlag: leastFlagTwo,
        gridFlag: gridFlagTwo,
        requiredCount: requiredCountTwo,
        configName: configNameTwo,
        ...rest2
      },
      saving,
      queryTemplateConfig,
    } = this.props;
    return (
      <Tabs animated={false}>
        <Tabs.TabPane
          tab={intl.get(`spfm.investigationDefinition.view.message.tab.contact`).d('联系人信息')}
          key="contact"
        >
          <FieldTable
            col={2}
            saving={saving}
            dataSource={dataSourceOne}
            gridFlag={gridFlagOne}
            atLeastOneFlag={leastFlagOne}
            investigateFlag={flagOne}
            configName={configNameOne}
            onHandleAdd={this.onHandleAddOne}
            onHandleChange={this.onHandleChangeOne}
            contactRequiredCount={contactRequiredCount}
            rest={rest1}
            queryTemplateConfig={queryTemplateConfig}
          />
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={intl.get(`spfm.investigationDefinition.view.title.addressMessage`).d('地址信息')}
          key="address"
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
            requiredCount={requiredCountTwo}
            rest={rest2}
            queryTemplateConfig={queryTemplateConfig}
            configName={configNameTwo}
          />
        </Tabs.TabPane>
      </Tabs>
    );
  }
}
