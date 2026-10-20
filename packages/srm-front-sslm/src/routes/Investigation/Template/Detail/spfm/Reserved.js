/*
 * @Date: 2022-02-15 14:40:21
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import FieldTable from './FieldTable';

@formatterCollections({
  code: ['spfm.investigationDefinition'],
})
export default class Reserved extends React.PureComponent {
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
  onHandleChange({
    investigateFlag,
    atLeastOneFlag,
    requiredCount,
    customerRequiredCount,
    contactRequiredCount,
  }) {
    const {
      dataSource: { lines, ...other },
      onHandleSwitchChange,
    } = this.props;
    onHandleSwitchChange({
      ...other,
      investigateFlag,
      atLeastOneFlag,
      requiredCount,
      customerRequiredCount,
      contactRequiredCount,
    });
  }

  render() {
    const {
      dataSource: {
        lines,
        configDescription,
        configName,
        investigateFlag,
        atLeastOneFlag,
        gridFlag,
        requiredCount,
        contactRequiredCount,
        customerRequiredCount,
        ...rest
      },
      saving,
      queryTemplateConfig,
      col = 3,
    } = this.props;
    return (
      <Tabs animated={false}>
        <Tabs.TabPane tab={configDescription} key={configName}>
          <FieldTable
            col={col}
            saving={saving}
            dataSource={lines}
            gridFlag={gridFlag}
            configName={configName}
            atLeastOneFlag={atLeastOneFlag}
            investigateFlag={investigateFlag}
            onHandleAdd={this.onHandleAdd}
            onHandleChange={this.onHandleChange}
            requiredCount={requiredCount}
            contactRequiredCount={contactRequiredCount}
            customerRequiredCount={customerRequiredCount}
            rest={rest}
            queryTemplateConfig={queryTemplateConfig}
          />
        </Tabs.TabPane>
      </Tabs>
    );
  }
}
